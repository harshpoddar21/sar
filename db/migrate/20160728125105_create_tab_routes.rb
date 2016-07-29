class CreateTabRoutes < ActiveRecord::Migration
  def change
    create_table :tab_routes do |t|
      t.text :name

      t.timestamps null: false
    end
  end
end
