class CreateIvrCallLogs < ActiveRecord::Migration
  def change
    create_table :ivr_call_logs do |t|
      t.text :phone_number
      t.integer :success

      t.timestamps null: false
    end
  end
end
