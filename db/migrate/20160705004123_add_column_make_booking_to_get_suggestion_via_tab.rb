class AddColumnMakeBookingToGetSuggestionViaTab < ActiveRecord::Migration
  def change
    add_column :get_suggestion_via_tabs, :make_booking, :integer
  end
end
