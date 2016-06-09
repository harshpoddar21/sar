class AddColumnRouteTypeToTransaction < ActiveRecord::Migration
  def change
    add_column :transactions, :route_type, :text
  end
end
