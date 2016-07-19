class ServiceController < ApplicationController


  def getDriverInfo

    routeId=params[:routeId]

    if routeId==nil

      raise CustomError::ParamsException,"Invalid Parameters"
    else
      if [831,832].include? routeId.to_i
        driverIds=[995,986,493,992,644,1017]
        driverPositions=Array.new
        driverIds.each do |driverId|
          vehicle=Vehicle.getVehicleDriverId driverId

          fromPointId,toPointId,complete=vehicle.getPositionBetweenPick
          etaPoints=vehicle.getEtaForDifferentPoints
          a=Hash.new
          a["driverId"]=driverId
          a["fromPointId"]=fromPointId
          a["toPointId"]=toPointId
          a["complete"]=complete
          a["data"]=JSON.parse etaPoints if etaPoints!=nil
          driverPositions.push a


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
      if Rails.env.production?

        routeId=64

      else

        routeId=45
      end
    else

      routeType=Route::SUGGESTED_ROUTE
      if Rails.env.production?

        routeId=73

      else

        routeId=45

      end
    end

    route=Route.getRouteByRouteId routeType,routeId
    pickUp=route.getPickUpPoints
    render :json=>Response.new(true,pickUp).to_json

  end

  def tracking

  end

  def refreshEtaForDiffPoints
    driverIds=[995,986,493,992,644,1017]

    driverIds.each do |driverId|
      vehicle=Vehicle.getVehicleDriverId driverId
      vehicle.refreshEtaForDiffPoints
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