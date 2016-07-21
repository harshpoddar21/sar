class CreateWhatsAppData < ActiveRecord::Migration
  def change
    create_table :whats_app_data do |t|
      t.text :location
      t.text :data

      t.timestamps null: false
    end
  end
end
