class AddColumnLocationIdToTabPick < ActiveRecord::Migration
  def change
    add_column :tab_picks, :location_id, :integer
  end
end
