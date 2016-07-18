class AddColumnTripIdToRouteEtaStatus < ActiveRecord::Migration
  def change
    add_column :route_eta_statuses, :trip_id, :integer
  end
end
