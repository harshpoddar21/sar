class CreateRouteMappings < ActiveRecord::Migration
  def change
    create_table :route_mappings do |t|
      t.text :from
      t.text :to
      t.integer :route_id

      t.timestamps null: false
    end
  end
end
