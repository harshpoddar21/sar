class CreateRouteDeadTimeAndDistances < ActiveRecord::Migration
  def change
    create_table :route_dead_time_and_distances do |t|
      t.integer :route_id_1
      t.integer :route_id_2
      t.integer :distance
      t.integer :time
      t.integer :dep_time

      t.timestamps null: false
    end
  end
end
