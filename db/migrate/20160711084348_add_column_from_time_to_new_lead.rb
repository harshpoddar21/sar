class AddColumnFromTimeToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :from_time, :text
  end
end
