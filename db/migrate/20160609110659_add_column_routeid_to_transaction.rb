class AddColumnRouteidToTransaction < ActiveRecord::Migration
  def change
    add_column :transactions, :routeid, :integer
  end
end
