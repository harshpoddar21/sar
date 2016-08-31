class CreatePtCustomerResponses < ActiveRecord::Migration
  def change
    create_table :pt_customer_responses do |t|
      t.text :phone_number
      t.integer :response

      t.timestamps null: false
    end
  end
end
