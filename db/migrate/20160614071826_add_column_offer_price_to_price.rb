class AddColumnOfferPriceToPrice < ActiveRecord::Migration
  def change
    add_column :prices, :offer_price, :integer
  end
end
