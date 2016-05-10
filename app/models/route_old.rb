class RouteOld<ActiveRecord::Base
  establish_connection "log_database_#{Rails.env}".to_sym
  self.table_name = 'routes'


end