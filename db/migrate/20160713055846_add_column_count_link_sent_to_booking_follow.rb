class AddColumnCountLinkSentToBookingFollow < ActiveRecord::Migration
  def change
    add_column :booking_follows, :count_link_sent, :integer
  end
end
