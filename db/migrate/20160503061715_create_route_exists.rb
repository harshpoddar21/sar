class CreateRouteExists < ActiveRecord::Migration
  def change
    create_table :route_exists do |t|
      t.text :name
      t.text :route_points

      t.timestamps null: false
    end
  end
end
