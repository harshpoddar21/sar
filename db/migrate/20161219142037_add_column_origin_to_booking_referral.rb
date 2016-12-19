class AddColumnOriginToBookingReferral < ActiveRecord::Migration
  def change
    add_column :booking_referrals, :origin, :integer
  end
end
