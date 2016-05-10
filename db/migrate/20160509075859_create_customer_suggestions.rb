class CreateCustomerSuggestions < ActiveRecord::Migration
  def change
    create_table :customer_suggestions do |t|
      t.text :from_str
      t.float :from_lat
      t.float :from_lng
      t.float :to_lat
      t.float :to_lng
      t.text :to_str
      t.text :customer_number
      t.text :from_time
      t.text :to_time
      t.text :from_mode
      t.text :to_mode

      t.timestamps null: false
    end
  end
end
