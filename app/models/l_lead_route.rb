class LLeadRoute < ActiveRecord::Base

  def self.getAllRouteIds
    routeIds=Array.new
    self.all.each do |leadRoute|

      routeIds.push leadRoute.route_id


    end


    routeIds

  end
end
