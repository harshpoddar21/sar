class AddColumnAffiliateToGetSuggestionViaTab < ActiveRecord::Migration
  def change
    add_column :get_suggestion_via_tabs, :affiliate, :text
  end
end
