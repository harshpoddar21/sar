class AddColumnChannelIdToLBtlChannel < ActiveRecord::Migration
  def change
    add_column :l_btl_channels, :channel_id, :text
  end
end
