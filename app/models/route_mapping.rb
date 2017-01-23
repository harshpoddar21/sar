class RouteMapping < ActiveRecord::Base


  def self.insertRouteMapping routeId,from,to

    mapping=self.where(:from=>from).where(:to=>to).last
    if mapping!=nil
      mapping.route_id=routeId
    else
      self.create(:from=>from,:to=>to,:routeId=>routeId)
    end
  end
end
