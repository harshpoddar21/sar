class AddColumnIsInterestedToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :is_interested, :integer
  end
end
