class Route


  attr_accessor :routeType,:routePoints,:name,:id,:pricing

  THRESHOLD_DISTANCE_TO_CONSIDER=100
  GRID_RES=0.001
  ROUTE_DOES_NOT_EXISTS="route_does_not_exists"
  LIVE_ROUTE="Live_route"
  SUGGESTED_ROUTE="suggested_route"
  ZONAL_WIDTH=50
  @@routeExistMap=Hash.new
  @@routeSuggestMap=Hash.new

  def self.getRouteBetween(origin,destination)

    #check first in route

    routeFound,routeType=getRouteBetweenPoints origin,destination
    route=nil

    if routeFound!=nil
      route=Route.new

      route.routeType=routeType
      route.routePoints=routeFound.route_points
      route.name=routeFound.name
      route.id=routeFound.id
      if (routeType=="Live_route")
        route.pricing=[500,4500]
      else
        price=Price.where(:routeid=>route.id)

        route.pricing=Array.new
        price.each do |pri|
          route.pricing.push pri.price
        end
      end

    end

    return route

  end

  def self.getSlotsForNonExistentRoute

    slotsFinal=Array.new
    (420..720).step(15).each do |time|
      slotsFinal.push time

    end

    return slotsFinal
  end
  def getSlots

    slotsFinal=Array.new

    if (routeType==LIVE_ROUTE)
      slots=Timestamp.where(:routeid=>id)
    else
      slots=TimestampSuggest.where(:routeid=>id)

    end


    slots.each do |slot|
      delta= 5*3600+1800

      timeFrom=((slot.fromtime.to_i+delta)/60)%1440
      timeTo=((slot.totime.to_i+delta)/60)%1440
      interval=slot.interval
      (timeFrom..timeTo).step(interval).each do |time|
        slotsFinal.push time
      end
    end

    slotsFinal
  end

  def self.initializeRouteCache

    @@routeExistMap=Hash.new
    @@routeSuggestMap=Hash.new
    RouteExist.where(:deleted => 0).each do |route|
      if (route.route_points!=nil)

        routePoints=Polylines::Decoder.decode_polyline(route.route_points)
        if (routePoints!=nil && routePoints.size>0)
          totalCoordsCount=1
          routePoints.each_with_index do |routePo,index|

            if index==routePoints.size-1
              next
            end
            if (@@routeExistMap[getMapKeyFor routePo]==nil)
              @@routeExistMap[getMapKeyFor routePo]=Hash.new
            end

            if (@@routeExistMap[getMapKeyFor routePo][route.id]==nil)
              @@routeExistMap[getMapKeyFor routePo][route.id]=Array.new
            end

            getAllCoordsForLineSeg(routePo,routePoints[index+1]).each do |point|
              point["id"]=totalCoordsCount
              totalCoordsCount=totalCoordsCount+1
              if (@@routeExistMap[getMapKeyFor [point["lat"],point["lng"]]]==nil)
                @@routeExistMap[getMapKeyFor [point["lat"],point["lng"]]]=Hash.new
              end

              if (@@routeExistMap[getMapKeyFor [point["lat"],point["lng"]]][route.id]==nil)
                @@routeExistMap[getMapKeyFor [point["lat"],point["lng"]]][route.id]=Array.new
              end
              @@routeExistMap[getMapKeyFor [point["lat"],point["lng"]]][route.id].push point
            end

          end

        end

      end
    end
    RouteSuggest.all.each do |route|
      if (route.route_points!=nil)

        routePoints=Polylines::Decoder.decode_polyline(route.route_points)
        if (routePoints!=nil && routePoints.size>0)
          totalCoordsCount=1
          routePoints.each_with_index do |routePo,index|

            if index==routePoints.size-1
              next
            end
            if (@@routeSuggestMap[getMapKeyFor routePo]==nil)
              @@routeSuggestMap[getMapKeyFor routePo]=Hash.new
            end

            if (@@routeSuggestMap[getMapKeyFor routePo][route.id]==nil)
              @@routeSuggestMap[getMapKeyFor routePo][route.id]=Array.new
            end

            getAllCoordsForLineSeg(routePo,routePoints[index+1]).each do |point|
              point["id"]=totalCoordsCount
              totalCoordsCount=totalCoordsCount+1
              if (@@routeSuggestMap[getMapKeyFor [point["lat"],point["lng"]]]==nil)
                @@routeSuggestMap[getMapKeyFor [point["lat"],point["lng"]]]=Hash.new
              end

              if (@@routeSuggestMap[getMapKeyFor [point["lat"],point["lng"]]][route.id]==nil)
                @@routeSuggestMap[getMapKeyFor [point["lat"],point["lng"]]][route.id]=Array.new
              end
              @@routeSuggestMap[getMapKeyFor [point["lat"],point["lng"]]][route.id].push point
            end

          end

        end

      end
    end
  end

  private

  def self.getMapKeyFor point

    (point[0]*1000).to_i.to_s+"_"+(point[1]*1000).to_i.to_s

  end

  def self.getAllCoordsForLineSeg(coord1,coord2)
    totalCoords=Array.new
    delta_in_x=coord2[0]-coord1[0]
    delta_in_y=coord2[1]-coord1[1]
    totalDistance=Location.distance(coord1,coord2)
    (0..totalDistance.to_i).step(20) do |distance|
      coord=Hash.new
      coord["lat"]=coord1[0]+((distance.to_f/totalDistance)*delta_in_x)
      coord["lng"]=coord1[1]+((distance.to_f/totalDistance)*delta_in_y)
      totalCoords.push coord
    end

    totalCoords
  end
  def self.getRouteBetweenPoints(origin,destination)
    route=getRouteLiveBetweenPoints origin,destination
    if (route==nil)
      route=getRouteSuggestedBetweenPoints origin,destination
      if (route!=nil)

        return route,SUGGESTED_ROUTE
      else
        return nil,nil
      end

    else
      return route,LIVE_ROUTE
    end

  end



  def self.checkIfPointGoesBetweenRoute(origin,destination,route)

    route_points=route.route_points
    if (route_points==nil)
     # logger.error "Route Points does not exits"
      return false
    end

    points=Polylines::Decoder.decode_polyline(route_points)
    if points==nil || points.size<2
      return false
    end

    (0..points.size-2).each do |index|

      distanceOrigin,distanceDestination= getMinimumdistanceOfOriginDestionationOnSubRoute(origin,destination,points[0],points[1])

      if distanceOrigin<THRESHOLD_DISTANCE_TO_CONSIDER && distanceDestination<THRESHOLD_DISTANCE_TO_CONSIDER

        return true

      end

    end

    return false


  end

  def self.getMinimumdistanceOfOriginDestionationOnSubRoute(origin,destination,start,endP)
    slope=((endP[1]-start[1])/(endP[0]-start[0]))
    constant=(endP[1]-slope*endP[0])
    constantO=origin[1]+(1/slope)*origin[0]
    constantD=destination[1]+(1/slope)*destination[0]
    pointXO=(constantO-constant)/(slope-1/slope)
    pointYO=((constant/slope**2)+constantO)/(1+1/slope**2)
    pointXD=(constantD-constant)/(slope-1/slope)
    pointYD=((constant/slope**2)+constantD)/(1+1/slope**2)
    distanceOrigin=Location::distance(origin,[pointXO,pointYO])
    distanceDestination=Location::distance destination,[pointXD,pointYD]
    return distanceOrigin,distanceDestination
  end




  def self.getRouteLiveBetweenPoints(origin,destination)
    possibleOriginRoutes=Hash.new
    possibleDestinationRoutes=Hash.new

    (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset|
      (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset2|
        originC=origin.dup
        originC[0]=originC[0]+GRID_RES*offset
        originC[1]=originC[1]+GRID_RES*offset2
      if (@@routeExistMap[getMapKeyFor originC]!=nil)
        @@routeExistMap[getMapKeyFor originC].each do |key,value|
          if (possibleOriginRoutes[key]==nil)
            possibleOriginRoutes[key]=Array.new
          end
          possibleOriginRoutes[key]=possibleOriginRoutes[key]+value
        end
      end
      end

    end

    (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset|
      (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset2|
        destinationC=destination.dup
        destinationC[0]=destinationC[0]+GRID_RES*offset
        destinationC[1]=destinationC[1]+GRID_RES*offset2
        if (@@routeExistMap[getMapKeyFor destinationC]!=nil)
          @@routeExistMap[getMapKeyFor destinationC].each do |key,value|
            if (possibleDestinationRoutes[key]==nil)
              possibleDestinationRoutes[key]=Array.new
            end
            possibleDestinationRoutes[key]=possibleDestinationRoutes[key]+value
          end
        end
      end

    end

    possibleRouteIds=possibleOriginRoutes.keys & possibleDestinationRoutes.keys

    if (possibleRouteIds.size>0)
      possibleRouteIds.each do |routeId|

        if (possibleOriginRoutes[routeId].first["id"]<possibleDestinationRoutes[routeId].last["id"])
          return RouteExist.find_by(:id=>routeId)
        end

      end
    end
    return nil
  end


  def self.getRouteSuggestedBetweenPoints(origin,destination)
    possibleOriginRoutes=Hash.new
    possibleDestinationRoutes=Hash.new

    distance=Hash.new

    (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset|
      (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset2|
        originC=origin.dup
        originC[0]=originC[0]+GRID_RES*offset
        originC[1]=originC[1]+GRID_RES*offset2
        if (@@routeSuggestMap[getMapKeyFor originC]!=nil)
          @@routeSuggestMap[getMapKeyFor originC].each do |key,value|
            if possibleOriginRoutes[key]==nil
              possibleOriginRoutes[key]=Array.new
            end
            distance[key]=Location.distance(origin,originC)
            possibleOriginRoutes[key]=possibleOriginRoutes[key]+value
          end
        end
      end

    end

    (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset|
      (-1*ZONAL_WIDTH..1*ZONAL_WIDTH).each do |offset2|
        destinationC=destination.dup
        destinationC[0]=destinationC[0]+GRID_RES*offset
        destinationC[1]=destinationC[1]+GRID_RES*offset2
        if (@@routeSuggestMap[getMapKeyFor destinationC]!=nil)
          @@routeSuggestMap[getMapKeyFor destinationC].each do |key,value|
            if (possibleDestinationRoutes[key]==nil)
              possibleDestinationRoutes[key]=Array.new
            end
            possibleDestinationRoutes[key]=possibleDestinationRoutes[key]+value
          end
        end
      end
    end

    possibleRouteIds=possibleOriginRoutes.keys & possibleDestinationRoutes.keys


    if (possibleRouteIds.size>0)
      minDistance=1000000
      selRouteId=nil
      possibleRouteIds.each do |routeId|

        if (possibleOriginRoutes[routeId].first["id"]<possibleDestinationRoutes[routeId].last["id"] && distance[routeId]<minDistance)

          selRouteId=routeId
          minDistance=distance[routeId]
        end

      end

      return RouteSuggest.find_by(:id=>selRouteId)
    end
    return nil
  end


  def self.createRoute name,pick,timestamp,pricing,routeType

    if routeType==SUGGESTED_ROUTE
      if (RouteSuggest.find_by(:name=>name)!=nil)
        deleteSuggestedRouteByName(name)
      end
       pickPointLatLng=Array.new
       pick.each do |pi|
         point=Hash.new
         point["lat"]=pi[1]
         point["lng"]=pi[2]
         pickPointLatLng.push point
       end
       dir=GoogleDirection.new(pickPointLatLng)
       dir.execute
       routePoints=""
       if dir.overviewPolyline!=nil
         routePoints=dir.overviewPolyline
       end
      route=RouteSuggest.create(:name=>name,:route_points=>routePoints)

    pick.each do |pic|
      if pic.length==4
        PickUp.create(:routeid=>route.id,:name=>pic[0],:lat=>pic[1],:lng=>pic[2],:landmark=>pic[3])
      else
        render :text=>"Error"
      end
    end
    timestamp.each do |tim|
      TimestampSuggest.create(:routeid=>route.id,:fromtime=>tim[0],:totime=>tim[1],:interval=>tim[2])
    end

    pricing.each do |pri|
      Price.create :routeid=>route.id,:price=>pri[0],:pass_type=>pri[1]
    end

    return true,route
    end

    return false,nil

  end


  def self.deleteSuggestedRouteByName(name)

    routes=RouteSuggest.where(:name=>name)
    if (routes!=nil)
      routes.each do |route|
        routeid=route.id
        route.destroy!
        Price.where(:routeid=>routeid).each do |ro|
          ro.destroy!
        end
        PickUp.where(:routeid=>routeid).each do |ro|
          ro.destroy!
        end
        TimestampSuggest.where(:routeid=>routeid).each do |ro|
          ro.destroy!
        end

      end
    end
  end

end