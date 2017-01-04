class AddColumnToLocationIdToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :to_location_id, :integer
  end
end
