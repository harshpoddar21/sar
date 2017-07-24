class RouteController < ApplicationController

  def submitPickUpPointClusterMapping
    data=params[:data]

    if data!=nil

      data.each do |mapping|

        locationId=mapping["Location Id"]
        pickUpPointName=mapping["Pickup Point Name"]
        clusterName=mapping["Cluster Name"]

        if locationId==nil || pickUpPointName==nil || clusterName==nil
          raise CustomError::ParamsException,"Invalid Params"
        end
        PickUpPointClusterMapping.insertMapping locationId,pickUpPointName,clusterName
      end

    end

    render :text=>"OK"

  end


  def submitLeadRoutes
    data=params[:data]

    if data!=nil

      data.each do |mapping|

        routeId=mapping["Route Id"]
        name=mapping["Route Name"]
        isReverse=mapping["Is Reverse Route"]

        if routeId==nil || name==nil || isReverse==nil
          raise CustomError::ParamsException,"Invalid Params"
        end
        LLeadRoute.insertRoute routeId,name,isReverse
      end

    end

    render :text=>"OK"

  end

  def submitRouteMapping
    data=params[:data]

    if data!=nil

      data.each do |mapping|

        from=mapping["From"]
        to=mapping["To"]
        routeId=mapping["Route Id"]

        if routeId==nil || from==nil || to==nil
          raise CustomError::ParamsException,"Invalid Params"
        end
        RouteMapping.insertRouteMapping routeId,from,to
      end

    end

    render :text=>"OK"

  end


  def calculateRouteLengthAndTimeTaken


    routeDetail=Hash.new

    RouteDetail.all.each do |det|

      if routeDetail[det.route_id]==nil
        routeDetail[det.route_id]=Array.new
      end

      routeDetail[det.route_id].push({ "lat" => det.lat , "lng" => det.lng})



    end

    puts routeDetail

    depTime=Time.utc 2017,07,26

    routeDetail.each do |routeId,details|

      (depTime.to_i+1.5*3600..depTime.to_i+16*3600).step(1800).each do |depTimeI|

        entry=RouteTimeAndDistance.where(:route_id => routeId).where(:departure_time=>depTimeI)

        if entry.size>0

          next

        end

        go=GoogleDirection.new routeDetail[routeId],depTimeI.to_i,"pessimistic"
        go.execute
        duration=go.duration_in_traffic
        distance=go.distance
        RouteTimeAndDistance.create(:route_id=>routeId,:time=>duration,:distance=>distance,:departure_time=>depTimeI)

      end

    end



  end

  def calculateDeadDistanceAndTimeBetweenRoutes

    routeDetail=Hash.new

    RouteDetail.all.each do |det|

      if routeDetail[det.route_id]==nil
        routeDetail[det.route_id]=Array.new
      end

      routeDetail[det.route_id].push({ "lat" => det.lat , "lng" => det.lng})
    end
      depTime=Time.utc 2017,07,26

      routeDetail.each do |routeId,details|

        routeDetail.each do |routeId2,details2|





            go=GoogleDirection.new [details[details.size-1],details2[0]],depTime.to_i+3*3600,"pessimistic"
            go.execute
            duration=go.duration_in_traffic
            distance=go.distance
            RouteDeadTimeAndDistance.create(:route_id_1=>routeId,:route_id_2=>routeId2,:time=>duration,:distance=>distance,:dep_time=>depTime.to_i+3*3600)



        end

      end




  end



  def parseDeadDistance

    a=File.read("/var/www/Ruby/sar/allOps.json")
    deadJson=JSON.parse a

    RmsRoute.all.each do |routeDetail|

      RmsRoute.all.each do |routeDetail2|


        startRoute=routeDetail2
        endRoute=routeDetail


        if deadJson[endRoute.end_location]==nil

          puts endRoute.end_location+" not found"
          next

        end
        if deadJson[endRoute.end_location][startRoute.start_location]==nil

          puts startRoute.start_location+" is not found in "+endRoute.end_location
          next

        end
        deadJson[endRoute.end_location][startRoute.start_location]["tripCompare"].each do |trip|

          RouteDeadTimeAndDistance.create(:route_id_1=>endRoute.route_id,:route_id_2=>startRoute.route_id,:distance=>trip["distance"],:dep_time=>trip["startTimeA"],:time=>trip["eta"])

        end



      end

    end

  end

end