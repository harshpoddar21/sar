class RemoveColumnFromLocationIdFromLLead < ActiveRecord::Migration
  def change

    remove_column :l_leads, :from_location_id
  end
end
