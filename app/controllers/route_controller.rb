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
end