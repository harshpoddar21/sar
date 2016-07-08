class AddColumnCalledToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :called, :integer
  end
end
