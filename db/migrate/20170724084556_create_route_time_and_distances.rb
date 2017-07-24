class CreateRouteTimeAndDistances < ActiveRecord::Migration
  def change
    create_table :route_time_and_distances do |t|
      t.integer :route_id
      t.integer :time
      t.integer :departure_time
      t.integer :distance

      t.timestamps null: false
    end
  end
end
