class CreateSubscriptions < ActiveRecord::Migration
  def change
    create_table :subscriptions do |t|
      t.text :customer_number
      t.float :from_lat
      t.float :from_lng
      t.float :to_lat
      t.float :to_lng
      t.text :from_str
      t.text :from_mode
      t.text :from_time
      t.text :to_time
      t.text :to_str
      t.text :to_mode
      t.integer :route_type
      t.integer :routeid

      t.timestamps null: false
    end
  end
end
