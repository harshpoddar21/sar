class CreateLLeadFeedbacks < ActiveRecord::Migration
  def change
    create_table :l_lead_feedbacks do |t|
      t.text :response
      t.text :phone_number

      t.timestamps null: false
    end
  end
end
