class CreateDtcRoutes < ActiveRecord::Migration
  def change
    create_table :dtc_routes do |t|
      t.text :name

      t.timestamps null: false
    end
  end
end
