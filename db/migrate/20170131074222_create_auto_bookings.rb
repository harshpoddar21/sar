class CreateAutoBookings < ActiveRecord::Migration
  def change
    create_table :auto_bookings do |t|
      t.integer :booking_id
      t.text :phone_number

      t.timestamps null: false
    end
  end
end
