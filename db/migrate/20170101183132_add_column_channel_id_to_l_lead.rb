class AddColumnChannelIdToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :channel_id, :integer
  end
end
