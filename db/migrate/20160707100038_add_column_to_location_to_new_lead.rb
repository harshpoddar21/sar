class AddColumnToLocationToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :to_location, :text
  end
end
