class AddColumnRouteTypeToCustomerSuggestion < ActiveRecord::Migration
  def change
    add_column :customer_suggestions, :route_type, :integer
  end
end
