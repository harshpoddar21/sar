class CreateRouteDetails < ActiveRecord::Migration
  def change
    create_table :route_details do |t|
      t.integer :route_id
      t.float :lat
      t.float :lng
      t.integer :position

      t.timestamps null: false
    end
  end
end
