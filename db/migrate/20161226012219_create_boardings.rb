class CreateBoardings < ActiveRecord::Migration
  def change
    create_table :boardings do |t|
      t.text :customer_number
      t.integer :booking_id
      t.integer :promoter_id

      t.timestamps null: false
    end
  end
end
