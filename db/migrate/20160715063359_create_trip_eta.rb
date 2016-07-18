class CreateTripEta < ActiveRecord::Migration
  def change
    create_table :trip_eta do |t|
      t.integer :eta
      t.integer :locationid
      t.integer :routeid
      t.integer :start_time
      t.text :remarks
      t.integer :driverid

      t.timestamps null: false
    end
  end
end
