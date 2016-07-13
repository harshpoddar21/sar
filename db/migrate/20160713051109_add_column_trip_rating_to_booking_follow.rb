class AddColumnTripRatingToBookingFollow < ActiveRecord::Migration
  def change
    add_column :booking_follows, :trip_rating, :integer
  end
end
