class OpVehicle < ActiveRecord::Base
  establish_connection "operations".to_sym

  self.table_name = "vehicles"

end
