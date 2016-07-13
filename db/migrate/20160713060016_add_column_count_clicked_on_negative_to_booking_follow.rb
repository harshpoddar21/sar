class AddColumnCountClickedOnNegativeToBookingFollow < ActiveRecord::Migration
  def change
    add_column :booking_follows, :count_clicked_on_negative, :integer
  end
end
