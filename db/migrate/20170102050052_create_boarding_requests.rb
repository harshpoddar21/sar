class CreateBoardingRequests < ActiveRecord::Migration
  def change
    create_table :boarding_requests do |t|
      t.text :from
      t.text :to
      t.text :phone_number
      t.text :channelId
      t.text :channelCategoryId
      t.text :campaignId
      t.integer :requested_boarding_time

      t.timestamps null: false
    end
  end
end
