class AddColumnChannelIdToBoardingRequest < ActiveRecord::Migration
  def change
    add_column :boarding_requests, :channel_id, :text
  end
end
