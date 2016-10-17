class CreateDtcRouteLocations < ActiveRecord::Migration
  def change
    create_table :dtc_route_locations do |t|
      t.integer :routeid
      t.integer :locationid

      t.timestamps null: false
    end
  end
end
