class AddColumnSubIdToCustomerSuggestion < ActiveRecord::Migration
  def change
    add_column :customer_suggestions, :sub_id, :text
  end
end
