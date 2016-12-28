class CreateTabPickNews < ActiveRecord::Migration
  def change
    create_table :tab_pick_news do |t|
      t.integer :location_id
      t.text :name

      t.timestamps null: false
    end
  end
end
