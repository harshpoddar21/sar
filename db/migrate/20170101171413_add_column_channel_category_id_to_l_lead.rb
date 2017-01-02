class AddColumnChannelCategoryIdToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :channel_category_id, :text
  end
end
