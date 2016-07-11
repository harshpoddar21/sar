class AddColumnToTimeToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :to_time, :text
  end
end
