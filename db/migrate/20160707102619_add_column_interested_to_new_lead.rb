class AddColumnInterestedToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :interested, :integer
  end
end
