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
    if routeId==831

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


  end
end