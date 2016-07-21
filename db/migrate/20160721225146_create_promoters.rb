class CreatePromoters < ActiveRecord::Migration
  def change
    create_table :promoters do |t|
      t.text :username
      t.text :password

      t.timestamps null: false
    end
  end
end
