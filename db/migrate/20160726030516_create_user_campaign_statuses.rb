class CreateUserCampaignStatuses < ActiveRecord::Migration
  def change
    create_table :user_campaign_statuses do |t|
      t.integer :campaign_id
      t.integer :times_sent
      t.integer :unsubscribed

      t.timestamps null: false
    end
  end
end
