class AddColumnDestinationToBookingReferral < ActiveRecord::Migration
  def change
    add_column :booking_referrals, :destination, :integer
  end
end
