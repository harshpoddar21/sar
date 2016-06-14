class AddColumnPriceSingleToPrice < ActiveRecord::Migration
  def change
    add_column :prices, :price_single, :integer
  end
end
