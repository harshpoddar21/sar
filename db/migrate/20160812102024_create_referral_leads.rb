class CreateReferralLeads < ActiveRecord::Migration
  def change
    create_table :referral_leads do |t|
      t.text :phone_number
      t.integer :referral_code

      t.timestamps null: false
    end
  end
end
