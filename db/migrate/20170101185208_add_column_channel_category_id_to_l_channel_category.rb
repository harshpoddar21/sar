class AddColumnChannelCategoryIdToLChannelCategory < ActiveRecord::Migration
  def change
    add_column :l_channel_categories, :channel_category_id, :text
  end
end
