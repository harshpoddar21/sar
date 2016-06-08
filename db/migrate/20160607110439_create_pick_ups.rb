class CreatePickUps < ActiveRecord::Migration
  def change
    create_table :pick_ups do |t|
      t.text :name
      t.float :lat
      t.float :lng
      t.integer :routeid

      t.timestamps null: false
    end
  end
end
