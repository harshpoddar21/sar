class CreateUrlShorteners < ActiveRecord::Migration
  def change
    create_table :url_shorteners do |t|
      t.integer :new_lead_id
      t.text :url_long
      t.integer :sign

      t.timestamps null: false
    end
  end
end
