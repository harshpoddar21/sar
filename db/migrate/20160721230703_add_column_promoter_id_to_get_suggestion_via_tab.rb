class AddColumnPromoterIdToGetSuggestionViaTab < ActiveRecord::Migration
  def change
    add_column :get_suggestion_via_tabs, :promoter_id, :integer
  end
end
