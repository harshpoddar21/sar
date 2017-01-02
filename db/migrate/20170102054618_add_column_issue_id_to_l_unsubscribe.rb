class AddColumnIssueIdToLUnsubscribe < ActiveRecord::Migration
  def change
    add_column :l_unsubscribes, :issue_id, :text
  end
end
