class CreateBoardingIvrResponses < ActiveRecord::Migration
  def change
    create_table :boarding_ivr_responses do |t|
      t.integer :response
      t.text :phone_number

      t.timestamps null: false
    end
  end
end
