class AddColumnUmsBookingIdToBoardingRequest < ActiveRecord::Migration
  def change
    add_column :boarding_requests, :ums_booking_id, :integer
  end
end
