class CreateRmsRoutes < ActiveRecord::Migration
  def change
    create_table :rms_routes do |t|
      t.integer :route_id
      t.text :name
      t.integer :is_b2b
      t.integer :reverse_route_id
      t.integer :start_time_in_secs
      t.float :start_latitude
      t.float :start_longitude
      t.float :end_latitude
      t.float :end_longitude
      t.integer :distance
      t.text :start_location
      t.text :end_location

      t.timestamps null: false
    end
  end
end
