class AddColumnFromIdToGetSuggestionViaTab < ActiveRecord::Migration
  def change
    add_column :get_suggestion_via_tabs, :from_id, :integer
  end
end
