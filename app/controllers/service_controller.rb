class ServiceController < ApplicationController


  def getDriverInfo

    routeId=params[:routeId]

    if routeId==nil

      raise CustomError::ParamsException,"Invalid Parameters"
    else
      if [831,832].include? routeId.to_i
        driverIds=Vehicle.getDriverIdsForRoute routeId
        vehicleNo=Vehicle.getVehicleNoForDriver driverIds
        driverPositions=Array.new
        indexDriver=0
        driverIds.each do |driverId|
          vehicle=Vehicle.getVehicleDriverId driverId

          fromPointId,toPointId,complete=vehicle.getPositionBetweenPickCache
          etaPoints=vehicle.getEtaForDifferentPoints
          a=Hash.new
          a["driverId"]=driverId
          a["vehicleNo"]=vehicleNo[indexDriver]
          a["fromPointId"]=fromPointId
          a["toPointId"]=toPointId
          a["complete"]=complete
          if etaPoints!=nil
           a["data"]=JSON.parse etaPoints
          else
           a["data"]=Hash.new
           a["data"]["status"]=Vehicle::EtaResponse::NO_TRIP_ALLOCATED
          end

          driverPositions.push a

          indexDriver=indexDriver+1

        end

        render :json=>driverPositions.to_json

      else
        raise Exception,"We do not offer tracking on this route yet."
      end
    end

  end

  def getPickUpPointsForRoute
    routeId=params[:routeId]
    routeType=Route::LIVE_ROUTE
    if routeId==831.to_s

      routeType=Route::SUGGESTED_ROUTE


        routeId=64

    else

      routeType=Route::SUGGESTED_ROUTE


        routeId=73

    end

    route=Route.getRouteByRouteId routeType,routeId
    pickUp=route.getPickUpPoints
    render :json=>Response.new(true,pickUp).to_json

  end

  def tracking

  end

  def refreshEtaForDiffPoints
    driverIds=Vehicle.getDriverIdsForRoute 831

    driverIds.each do |driverId|
      vehicle=Vehicle.getVehicleDriverId driverId
      vehicle.refreshEtaForDiffPoints
    end

    render :text=>"OK"

  end


  def refreshPositionForDiffPoints
    driverIds=Vehicle.getDriverIdsForRoute 831

    driverIds.each do |driverId|
      vehicle=Vehicle.getVehicleDriverId driverId
      vehicle.getPositionBetweenPick
    end

    render :text=>"OK"

  end
  before_filter :cors_preflight_check
  after_filter :cors_set_access_control_headers

# For all responses in this controller, return the CORS access control headers.
  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Max-Age'] = "1728000"
  end

# If this is a preflight OPTIONS request, then short-circuit the
# request, return only the necessary headers and return an empty
# text/plain.

  def cors_preflight_check
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version'
    headers['Access-Control-Max-Age'] = '1728000'
  end
end