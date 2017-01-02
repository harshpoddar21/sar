class AddColumnCampaignIdToBoardingRequest < ActiveRecord::Migration
  def change
    add_column :boarding_requests, :campaign_id, :text
  end
end
