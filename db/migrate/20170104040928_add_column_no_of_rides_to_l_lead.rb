class AddColumnNoOfRidesToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :no_of_rides, :integer
  end
end
