class RoutePoints < ActiveRecord::Base
  self.table_name = "ROUTE_POINTS"
  establish_connection "prms".to_sym
end