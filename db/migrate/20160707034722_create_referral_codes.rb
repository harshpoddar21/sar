class CreateReferralCodes < ActiveRecord::Migration
  def change
    create_table :referral_codes do |t|
      t.text :phone_number
      t.text :code

      t.timestamps null: false
    end
  end
end
