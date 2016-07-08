class AddColumnFromLocationToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :from_location, :text
  end
end
