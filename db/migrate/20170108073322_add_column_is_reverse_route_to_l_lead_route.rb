class AddColumnIsReverseRouteToLLeadRoute < ActiveRecord::Migration
  def change
    add_column :l_lead_routes, :is_reverse_route, :integer
  end
end
