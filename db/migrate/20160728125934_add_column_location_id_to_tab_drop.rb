class AddColumnLocationIdToTabDrop < ActiveRecord::Migration
  def change
    add_column :tab_drops, :location_id, :integer
  end
end
