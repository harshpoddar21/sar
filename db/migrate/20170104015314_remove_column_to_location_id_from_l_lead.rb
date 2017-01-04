class RemoveColumnToLocationIdFromLLead < ActiveRecord::Migration
  def change


    remove_column :l_leads, :to_location_id
  end
end
