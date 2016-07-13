class CreateBookingFollows < ActiveRecord::Migration
  def change
    create_table :booking_follows do |t|
      t.integer :booking_id
      t.integer :phone_number
      t.text :called
      t.text :response

      t.timestamps null: false
    end
  end
end
