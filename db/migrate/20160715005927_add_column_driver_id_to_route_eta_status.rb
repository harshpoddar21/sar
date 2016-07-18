class AddColumnDriverIdToRouteEtaStatus < ActiveRecord::Migration
  def change
    add_column :route_eta_statuses, :driverid, :integer
  end
end
