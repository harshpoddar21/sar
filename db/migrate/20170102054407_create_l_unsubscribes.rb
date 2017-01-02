class CreateLUnsubscribes < ActiveRecord::Migration
  def change
    create_table :l_unsubscribes do |t|
      t.integer :issue_type
      t.text :phone_number
      t.text :category_channel_id
      t.text :channel_id
      t.text :campaign_id

      t.timestamps null: false
    end
  end
end
