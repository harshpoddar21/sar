class AddColumnSubStatusToCustomerSuggestion < ActiveRecord::Migration
  def change
    add_column :customer_suggestions, :sub_status, :text
  end
end
