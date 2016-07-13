class AddColumnCountClickedOnPositiveToBookingFollow < ActiveRecord::Migration
  def change
    add_column :booking_follows, :count_clicked_on_positive, :integer
  end
end
