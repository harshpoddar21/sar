class AddColumnChannelCategoryIdToBoardingRequest < ActiveRecord::Migration
  def change
    add_column :boarding_requests, :channel_category_id, :text
  end
end
