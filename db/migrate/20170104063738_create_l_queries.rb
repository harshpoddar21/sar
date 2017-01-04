class CreateLQueries < ActiveRecord::Migration
  def change
    create_table :l_queries do |t|
      t.text :phone_number
      t.text :query
      t.text :campaign_id
      t.text :channel_id
      t.text :channel_category_id

      t.timestamps null: false
    end
  end
end
