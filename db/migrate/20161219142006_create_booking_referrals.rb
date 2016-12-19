class CreateBookingReferrals < ActiveRecord::Migration
  def change
    create_table :booking_referrals do |t|
      t.text :phone_number
      t.integer :dest

      t.timestamps null: false
    end
  end
end
