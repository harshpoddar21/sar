class CreateLLeads < ActiveRecord::Migration
  def change
    create_table :l_leads do |t|
      t.text :email
      t.text :phone_number
      t.text :from
      t.text :to
      t.text :mode_of_comute
      t.text :answer
      t.text :prefilled_answer
      t.integer :campaign_id

      t.timestamps null: false
    end
  end
end
