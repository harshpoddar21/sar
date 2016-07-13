class CreateUrlShortenerBookings < ActiveRecord::Migration
  def change
    create_table :url_shortener_bookings do |t|
      t.integer :booking_id
      t.text :p_link
      t.text :n_link

      t.timestamps null: false
    end
  end
end
