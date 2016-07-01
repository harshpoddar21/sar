class CreatePosterReferrals < ActiveRecord::Migration
  def change
    create_table :poster_referrals do |t|
      t.text :code
      t.text :phone_number

      t.timestamps null: false
    end
  end
end
