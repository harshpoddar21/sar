class CreateAffiliates < ActiveRecord::Migration
  def change
    create_table :affiliates do |t|
      t.text :phone_number
      t.integer :agent_id

      t.timestamps null: false
    end
  end
end
