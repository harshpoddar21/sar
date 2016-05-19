class CreateTransactions < ActiveRecord::Migration
  def change
    create_table :transactions do |t|
      t.text :phone_number
      t.text :email
      t.integer :status
      t.text :comments

      t.timestamps null: false
    end
  end
end
