class AddColumnRouteidToCustomerSuggestion < ActiveRecord::Migration
  def change
    add_column :customer_suggestions, :routeid, :integer
  end
end
