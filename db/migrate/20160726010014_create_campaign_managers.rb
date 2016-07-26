class CreateCampaignManagers < ActiveRecord::Migration
  def change
    create_table :campaign_managers do |t|
      t.text :phone_number
      t.integer :campaign_id
      t.integer :time_sent
      t.integer :positive_link_clicked
      t.integer :negative_link_clicked

      t.timestamps null: false
    end
  end
end
