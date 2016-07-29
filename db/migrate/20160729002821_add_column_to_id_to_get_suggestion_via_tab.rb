class AddColumnToIdToGetSuggestionViaTab < ActiveRecord::Migration
  def change
    add_column :get_suggestion_via_tabs, :to_id, :integer
  end
end
