class CreateNewLeads < ActiveRecord::Migration
  def change
    create_table :new_leads do |t|
      t.text :phone_number
      t.integer :whatsapp_status
      t.datetime :acquired_date
      t.integer :subscription_status
      t.integer :count_link_sent
      t.integer :count_clicked_on_positive
      t.integer :count_clicked_on_negative

      t.timestamps null: false
    end
  end
end
