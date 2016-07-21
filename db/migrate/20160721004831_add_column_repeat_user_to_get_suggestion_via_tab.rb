class AddColumnRepeatUserToGetSuggestionViaTab < ActiveRecord::Migration
  def change
    add_column :get_suggestion_via_tabs, :repeat_user, :integer
  end
end
