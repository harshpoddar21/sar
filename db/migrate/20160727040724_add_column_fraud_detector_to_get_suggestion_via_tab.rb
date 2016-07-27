class AddColumnFraudDetectorToGetSuggestionViaTab < ActiveRecord::Migration
  def change
    add_column :get_suggestion_via_tabs, :fraud_detector, :integer
  end
end
