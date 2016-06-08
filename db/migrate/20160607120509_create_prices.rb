class CreatePrices < ActiveRecord::Migration
  def change
    create_table :prices do |t|
      t.integer :routeid
      t.integer :price
      t.integer :pass_type

      t.timestamps null: false
    end
  end
end
