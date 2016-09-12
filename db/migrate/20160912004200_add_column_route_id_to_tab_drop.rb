class AddColumnRouteIdToTabDrop < ActiveRecord::Migration
  def change
    add_column :tab_drops, :route_id, :integer
  end
end
