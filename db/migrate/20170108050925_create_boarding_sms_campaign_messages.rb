class CreateBoardingSmsCampaignMessages < ActiveRecord::Migration
  def change
    create_table :boarding_sms_campaign_messages do |t|
      t.text :from
      t.text :to
      t.text :message

      t.timestamps null: false
    end
  end
end
