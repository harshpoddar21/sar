class CreateWhatsapps < ActiveRecord::Migration
  def change
    create_table :whatsapps do |t|
      t.text :group_name
      t.text :group_identifier

      t.timestamps null: false
    end
  end
end
