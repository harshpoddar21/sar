class AddColumnRouteIdToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :route_id, :integer
  end
end
