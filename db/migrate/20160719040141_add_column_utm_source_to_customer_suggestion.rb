class AddColumnUtmSourceToCustomerSuggestion < ActiveRecord::Migration
  def change
    add_column :customer_suggestions, :source, :text
  end
end
