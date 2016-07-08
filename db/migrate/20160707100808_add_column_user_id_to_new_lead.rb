class AddColumnUserIdToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :user_id, :integer
  end
end
