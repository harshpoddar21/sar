class CreateDtcLocations < ActiveRecord::Migration
  def change
    create_table :dtc_locations do |t|
      t.text :name

      t.timestamps null: false
    end
  end
end
