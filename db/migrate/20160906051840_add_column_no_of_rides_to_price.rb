class AddColumnNoOfRidesToPrice < ActiveRecord::Migration
  def change
    add_column :prices, :no_of_rides, :integer
  end
end
