class AddColumnRouteidToTimestamp < ActiveRecord::Migration
  def change
    add_column :timestamps, :routeid, :integer
  end
end
