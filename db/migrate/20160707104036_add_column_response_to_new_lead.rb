class AddColumnResponseToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :response, :text
  end
end
