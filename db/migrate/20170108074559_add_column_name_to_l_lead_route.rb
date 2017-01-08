class AddColumnNameToLLeadRoute < ActiveRecord::Migration
  def change
    add_column :l_lead_routes, :name, :text
  end
end
