class CreateSlots < ActiveRecord::Migration
  def change
    create_table :slots do |t|
      t.integer :routeid
      t.integer :timeinmins
      t.integer :locationid
      t.integer :deleted
      t.integer :distanceinmeters

      t.timestamps null: false
    end
  end
end
