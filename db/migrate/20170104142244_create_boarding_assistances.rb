class CreateBoardingAssistances < ActiveRecord::Migration
  def change
    create_table :boarding_assistances do |t|
      t.text :phone_number
      t.text :from
      t.text :to
      t.integer :route_id
      t.text :exec_no

      t.timestamps null: false
    end
  end
end
