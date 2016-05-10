class CreateRouteSuggests < ActiveRecord::Migration
  def change
    create_table :route_suggests do |t|
      t.text :name
      t.text :route_points

      t.timestamps null: false
    end
  end
end
