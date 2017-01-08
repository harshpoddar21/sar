class LLeadRoute < ActiveRecord::Base

  def self.getAllRouteIds
    routeIds=Array.new
    self.all.each do |leadRoute|

      routeIds.push leadRoute.route_id


    end


    routeIds

  end

  def self.isReverseRoute? routeId

    route=self.find_by_route_id routeId
    if route==nil
      false
    else
      route.is_reverse_route==1
    end
  end

  def self.insertRoute routeId,name,isReverse
    route=self.find_by_route_id routeId

    if route!=nil
      route.name=name
      route.is_reverse_route=isReverse
      route.save
    else
      route=self.new
      route.name=name
      route.is_reverse_route=isReverse
      route.route_id=routeId
      route.save
    end
  end
end
