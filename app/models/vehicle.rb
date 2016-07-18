class Vehicle

  attr_accessor :driverId,:routeId,:routeType,:trip,:current_lat,:current_lng
  TIME_BEFORE_DRIVER_IS_EXPECTED=30*60
  THRESHOLD_TO_CONSIDER_FOR_MAPPING_POINT=40
  TRIP_COMPLETED=2
  UNKNOWN_ERROR=-2
  DRIVER_CANNOT_BE_TRACKED=-1

  VEHICLE_GPS_COORD_URL="http://driverapi.goplus.in/shuttl/getDriversLocation"
  def initialize driver_id

    self.driverId= driver_id

    self.trip=Trip.where(:driverid=>driverId).last
    if trip!=nil
      self.routeId=trip.routeid
      if routeId==831

        if Rails.env.production? || true

          self.routeId=64
        else

          self.routeId=45
        end
      else

        if Rails.env.production? || true

          self.routeId=73
        else

          self.routeId=45

        end
      end

      trip.startTime=getCurrentTime-10*60
      trip.driverEndTime=0
      self.routeType=Route::SUGGESTED_ROUTE

    end


  end

  def self.getVehicleDriverId driverId

    Vehicle.new driverId

  end

  def getCurrentGpsCoord


    if current_lat!=nil && current_lng!=nil
      return [current_lat,current_lng,0]
    end

    response=ConnectionManager.makePostHttpRequest VEHICLE_GPS_COORD_URL,{"driverIds":[driverId]},{"Content-Type"=>"application/json"},true

    if response!=nil

      response=JSON.parse response.body

      if response["errorCode"]==0.to_s

        data=response["data"][0]

        self.current_lat= data["currentLatLng"]["latitude"]
        self.current_lng= data["currentLatLng"]["longitude"]

        return [current_lat,current_lng,0]

      end

    end
    return nil

  end




  def getCurrentPositionWithinRoute

    currentLat,currentLng,updated=getCurrentGpsCoord

    point,distanceToPoint=Route.getPositionOfCoordWithinSuggestedRoute currentLat,currentLng,routeId

    return point,distanceToPoint

  end

  def getPositionVehicleWithPickUpPoint

    pointCurrent,distanceToPoint=getCurrentPositionWithinRoute
    if distanceToPoint > Route::THRESHOLD_DISTANCE_TO_CONSIDER

      return nil,nil,nil

    end
    route=Route.getRouteByRouteId routeType,routeId

    pickUp=route.getPickUpPoints

    fromPick=nil
    toPick=nil

    fromPickPoint=nil
    toPickPoint=nil

    pickUp.each do |pick|

      point,distanceToPoint=Route.getPositionOfCoordWithinSuggestedRoute pick.lat,pick.lng,routeId
      if distanceToPoint > Route::THRESHOLD_DISTANCE_TO_CONSIDER
        raise Exception,"Invalid pick up on route"
      end

      if point["id"]<=pointCurrent["id"]
        fromPick=point
        fromPickPoint=pick
      end
      if point["id"]>pointCurrent["id"]
        toPick=point
        toPickPoint=pick

        break
      end
    end

    return pointCurrent,fromPick,fromPickPoint,toPick,toPickPoint

  end


  def getPositionBetweenPick

    pointCurrent,fromPick,fromPickPoint,toPick,toPickPoint=getPositionVehicleWithPickUpPoint
    if fromPick==nil
      return nil,nil,0
    end
    if fromPick!=nil && toPick==nil
      return fromPickPoint.id,fromPickPoint.id,0
    end

    if fromPick!=nil && toPick!=nil
      return fromPickPoint.id,toPickPoint.id,(pointCurrent["id"]-fromPick["id"])/(1.0*(toPick["id"]-fromPick["id"]))
    end

  end

  # Return NO_TRIP_ALLOCATED
  # if session has ended or driver has never be allocated trip
  # Return TOO_SOON_TO_COMPUTE_ETA
  # if allocated time and current time are 30 mins apart
  # RETURN SUCCESS
  # if trip startTime is more than current time and less than 30 mins apart
  # RETURN SUCCESS
  # if current time is nore than start time but driver has not ended trip and current time is less than threshold trip time completion
  # RETURN DRIVER_NOT_TRACKED
  # if driver is not within 100 m radial distance of route


  def refreshEtaForDiffPoints

    if routeId!=45 || routeId!=64 || routeId!=73
      return "Invalid route id"
    end
    etaResponse=EtaResponse.new
    route=Route.getRouteByRouteId routeType, routeId
    if trip==nil
      etaResponse.status=EtaResponse::NO_TRIP_ALLOCATED
      Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
      return EtaResponse::NO_TRIP_ALLOCATED
    end

    lat, lng, updated=getCurrentGpsCoord
    currentTime=getCurrentTime

    #driver is not on the route
    if trip.startTime-currentTime > TIME_BEFORE_DRIVER_IS_EXPECTED
      #ava allocation has happened but trip has not started
      etaResponse.status=EtaResponse::TOO_SOON_TO_COMPUTE_ETA
      Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
      return EtaResponse::TOO_SOON_TO_COMPUTE_ETA
    elsif trip.startTime-currentTime >0 && trip.startTime-currentTime<TIME_BEFORE_DRIVER_IS_EXPECTED

      lat, lng, updated=getCurrentGpsCoord

      if lat==nil || lng==nil
        etaResponse.status=EtaResponse::GPS_NOT_AVAILABLE
        Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
        return etaResponse
      end

      pickUpPoints=route.getPickUpPoints

      etaPick=Hash.new

      totalPickUpPoints=pickUpPoints.length

      #check if driver has reached startPoint
      distanceFromStartPoint=LocationUtil.distance([lat, lng], [pickUpPoints[0].lat, pickUpPoints[0].lng])
      timeDeltaToStartTrip=0
      if distanceFromStartPoint>Route::THRESHOLD_DISTANCE_TO_CONSIDER
        direction=GoogleDirection.new [{"lat"=> lat, "lng" => lng}, pickUpPoints[0]], trip.startTime
        direction.execute
        timeDeltaToStartTrip=direction.duration_in_traffic
      end
      remark=""
      if timeDeltaToStartTrip>15*60

        remark="Actual trip delta is "+timeDeltaToStartTrip.to_s
        timeDeltaToStartTrip=0
      end
      pickPointsA=Array.new
      (0..totalPickUpPoints-1).each do |no|
        pickPointsA.push pickUpPoints[no]
      end
      (1..totalPickUpPoints-1).each do |no|

        direction=GoogleDirection.new pickPointsA, trip.startTime+timeDeltaToStartTrip
        direction.execute
        etaPick[pickUpPoints[totalPickUpPoints-no].id]=trip.startTime+timeDeltaToStartTrip+direction.duration_in_traffic
        pickPointsA.pop
      end
      etaPick[pickUpPoints[0].id]=trip.startTime+timeDeltaToStartTrip
      locationEta=Hash.new

      etaPick.each do |key, value|

        locationEta[key]=value
        TripEta.create(:driverid => driverId, :locationid => key, :eta => value, :routeid => routeId, :remarks => remark)

      end

      etaResponse.status=EtaResponse::SUCCESS
      etaResponse.locationEta =locationEta
      Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json


    elsif currentTime-trip.startTime<Route::THRESHOLD_TIME_FOR_ROUTE_END && trip.driverEndTime==0


      currentPoint, distanceToPoint= self.getCurrentPositionWithinRoute #driver is in middle of a trip
      if distanceToPoint<Route::THRESHOLD_DISTANCE_TO_CONSIDER
        remark=""
        lat, lng, updated=getCurrentGpsCoord
        if distanceToPoint>THRESHOLD_TO_CONSIDER_FOR_MAPPING_POINT
          remark="Cannot map driver to route"
        else

          #sanitizing latitude longitude of drivers raw coordinates

          lat=currentPoint["lat"]
          lng=currentPoint["lng"]
        end



        driverLatLng=Hash.new
        driverLatLng["lat"]=lat
        driverLatLng["lng"]=lng

        pickUpPoints=route.getPickUpPoints

        pointCurrent, fromPick, fromPickPoint, toPick, toPickPoint=getPositionVehicleWithPickUpPoint
        startComputing=false
        startIndex=0
        if toPickPoint!=nil
          leftPickPoints=Array.new
          pickUpPoints.each do |pick|
            if pick.id==toPickPoint.id && !startComputing
              startComputing=true
            end
            if startComputing
              leftPickPoints.push pick
            else
              startIndex=startIndex+1
            end
          end
          locationEta=Hash.new
          totalPickUpPoints=pickUpPoints
          (0..totalPickUpPoints.length-1).each do |index|
            if index<startIndex
              locationEta[pickUpPoints[index].id]=-1
            else
              direction=GoogleDirection.new leftPickPoints.unshift(driverLatLng), getCurrentTime
              direction.execute
              locationEta[pickUpPoints[totalPickUpPoints.length-1-(index-startIndex)].id]=getCurrentTime+direction.duration_in_traffic
              leftPickPoints.pop
            end
          end
          etaResponse.status=EtaResponse::SUCCESS
          etaResponse.locationEta =locationEta
          Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json

        else
          if distanceToPoint>Route::THRESHOLD_DISTANCE_TO_CONSIDER

            RouteEtaStatus.create(:driverid => driverId, :routeid => routeId, :eta_status => DRIVER_CANNOT_BE_TRACKED)
            etaResponse.status=EtaResponse::DRIVER_CANNOT_BE_TRACKED
            Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
          else
            if fromPick!=nil
              RouteEtaStatus.create(:driverid => driverId, :routeid => routeId, :eta_status => TRIP_COMPLETED, :trip_id => trip.id)
              etaResponse.status=EtaResponse::TRIP_COMPLETED
              Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
            else
              etaResponse.status=EtaResponse::UNKNOWN_ERROR
              Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
              RouteEtaStatus.create(:driverid => driverId, :routeid => routeId, :eta_status => UNKNOWN_ERROR, :trip_id => trip.id)
            end
          end
        end
      else
        etaResponse.status=EtaResponse::DRIVER_CANNOT_BE_TRACKED
        Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
      end

    else
      # last sessions trip

      etaResponse.status=EtaResponse::TRIP_NOT_ALLOTED
      Rails.cache.write EtaResponse.getCacheKeyForDriverId(driverId), etaResponse.to_json
      return etaResponse

    end


  end

  def getEtaForDifferentPoints

    eta=Rails.cache.fetch(EtaResponse.getCacheKeyForDriverId(driverId))
    return eta
  end

  class EtaResponse

    CACHE_KEY="eta/"
    GPS_NOT_AVAILABLE=8
    NO_TRIP_ALLOCATED=1
    DRIVER_CANNOT_BE_TRACKED=4
    TRIP_COMPLETED=5
    UNKNOWN_ERROR=6
    TRIP_NOT_ALLOTED=7
    SUCCESS=3
    TOO_SOON_TO_COMPUTE_ETA=2
    attr_accessor :status,:locationEta
    def self.getCacheKeyForDriverId driverId

      return CACHE_KEY+"driverId".to_s


    end
  end
  
  def getCurrentTime
    
    Time.now.to_i

    
  end

end
