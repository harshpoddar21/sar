class CreateLeadConvertors < ActiveRecord::Migration
  def change
    create_table :lead_convertors do |t|
      t.text :phone_number
      t.text :email
      t.text :answer
      t.integer :is_interested

      t.timestamps null: false
    end
  end
end
