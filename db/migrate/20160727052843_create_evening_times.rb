class CreateEveningTimes < ActiveRecord::Migration
  def change
    create_table :evening_times do |t|
      t.text :phone_number
      t.text :evening_time

      t.timestamps null: false
    end
  end
end
