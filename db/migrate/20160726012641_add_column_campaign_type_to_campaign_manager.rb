class AddColumnCampaignTypeToCampaignManager < ActiveRecord::Migration
  def change
    add_column :campaign_managers, :campaign_type, :integer
  end
end
