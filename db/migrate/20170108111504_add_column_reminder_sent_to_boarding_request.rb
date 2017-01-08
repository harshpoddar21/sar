class AddColumnReminderSentToBoardingRequest < ActiveRecord::Migration
  def change
    add_column :boarding_requests, :reminder_sent, :integer
  end
end
