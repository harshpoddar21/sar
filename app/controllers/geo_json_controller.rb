class GeoJsonController < ApplicationController

  RMS_ROUTE_STOPS_API = "http://54.169.209.223/service/rms/getStopsByRoute"
  RMS_ROUTE_POINTS_API = "http://54.169.209.223/service/rms/getRoutePointsByRoute"

  def getRoutePointsGeoJsonByRoutes
    routeIds = "85,136,144,146,154,160,162,196,219,242,246,247,250,253,255,261,262,265,325,338,339,352,361,387,389,417,429,466,472,478,480,482,491,537,554,570,576,578,582,597,614,622,662,762,764,769,827,831"
    if(routeIds)
      routeIdArray = routeIds.split(",")
      hash = Hash.new
      hash["features"] = Array.new
      hash["type"]="FeatureCollection"
      routePointsByRoute = Hash.new
      routeIdArray.each do |routeId|
        request = Hash.new
        request["routeId"]=routeId.to_i
        response = ConnectionManager.postRequest(RMS_ROUTE_POINTS_API,request,8080)

        if(response != nil)
          response =  JSON.parse(response.body)
          routePoints = response["routePoints"]
          #routePoints = RoutePoints.where("route_id in (#{routeIds}) and deleted = 0").order(:route_id,:position)
          routePoints.each do |param|
            lat = param["latitude"]
            lng = param["longitude"]
            arr = Array.new
            arr.push(lng).push(lat)
            if(routePointsByRoute[routeId] == nil)
              routePointsByRoute[routeId] = Array.new
            end
            routePointsByRoute[routeId].push(arr)
        end

      end

      end
      routePointsByRoute.each do |routeId,routePointsArray|
        featureHash = Hash.new
        featureHash["type"] = "Feature"
        featureHash["properties"] = Hash.new
        featureHash["properties"]["routeid"] = routeId
        featureHash["geometry"] = Hash.new
        featureHash["geometry"]["coordinates"] = routePointsArray
        featureHash["geometry"]["type"] = "LineString"
        #featureHash["id"] = routeId.to_s + "a1h5m13e3d4" + routePointsArray.size().to_s
        #featureHash["paint"]["fill-color"]="#00ffff"
        hash["features"].push(featureHash)
        File.open("/home/yoda/Downloads/routejson/route_"+routeId.to_s+".geojson", "w+") do |f|
          f.write(featureHash.to_json)

        end
      end
      #routePoints= RoutePoints.where(route_id:routeIds)

      File.open("/home/yoda/Downloads/routejson/route_all.geojson", "w+") do |f|
        f.write(hash.to_json)
      end
    else
      render :json => 'Please Give Valid RouteIds'
    end
  end

  def getStopsGeoJsonByRoutes
    routeIds = "85,136,144,146,154,160,162,196,219,242,246,247,250,253,255,261,262,265,325,338,339,352,361,387,389,417,429,466,472,478,480,482,491,537,554,570,576,578,582,597,614,622,662,762,764,769,827,831"
    if(routeIds)
      routeIdArray = routeIds.split(",")
      hash = Hash.new
      hash["features"] = Array.new
      hash["type"]="FeatureCollection"
      stopsById = Hash.new
      routeIdArray.each do |routeId|
        request = Hash.new
        request["routeId"]=routeId.to_i
        response = ConnectionManager.postRequest(RMS_ROUTE_STOPS_API,request,8080)

        if(response != nil)
          response =  JSON.parse(response.body)
          if(response["stopDTOs"] != nil)
            response["stopDTOs"].each do |value|
              arr = Array.new

              arr.push(value["location"]["lng"]).push(value["location"]["lat"]).push(value["location"]["locationName"]).push(value["routeId"])
              stopsById[value["location"]["id"]]=arr
            end
          end
        end
      end

      stopsById.each do |locationId,lngLatArrayObject|
        featureHash = Hash.new
        featureHash["type"] = "Feature"
        featureHash["properties"] = Hash.new
        featureHash["properties"]["locationid"]=locationId

        featureHash["properties"]["routeid"]=lngLatArrayObject[3]
        featureHash["properties"]["title"]=lngLatArrayObject[2]
        featureHash["geometry"] = Hash.new
        featureHash["geometry"]["coordinates"] = [lngLatArrayObject[0],lngLatArrayObject[1]]
        featureHash["geometry"]["type"] = "Point";
        hash["features"].push(featureHash)
      end
      File.open("/home/yoda/Downloads/routejson/location_all.geojson", "w+") do |f|
        f.write(hash.to_json)
      end
    else
      render :json => "Route Ids can not be null"
    end

  end

end
