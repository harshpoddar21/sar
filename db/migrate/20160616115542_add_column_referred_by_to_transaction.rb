class AddColumnReferredByToTransaction < ActiveRecord::Migration
  def change
    add_column :transactions, :referred_by, :text
  end
end
