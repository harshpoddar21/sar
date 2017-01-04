class CreatePointOwners < ActiveRecord::Migration
  def change
    create_table :point_owners do |t|
      t.text :from
      t.text :owner

      t.timestamps null: false
    end
  end
end
