class AddColumnFromLocationIdToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :from_location_id, :integer
  end
end
