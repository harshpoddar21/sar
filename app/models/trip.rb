class Trip < ActiveRecord::Base
  establish_connection "operations".to_sym

  self.table_name = "Trip"

end