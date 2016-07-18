class CreateRouteEtaStatuses < ActiveRecord::Migration
  def change
    create_table :route_eta_statuses do |t|
      t.integer :routeid
      t.integer :eta_status

      t.timestamps null: false
    end
  end
end
