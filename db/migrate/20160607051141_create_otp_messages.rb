class CreateOtpMessages < ActiveRecord::Migration
  def change
    create_table :otp_messages do |t|
      t.integer :otp
      t.text :phone_number

      t.timestamps null: false
    end
  end
end
