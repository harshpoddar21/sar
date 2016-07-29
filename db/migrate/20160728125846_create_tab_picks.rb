class CreateTabPicks < ActiveRecord::Migration
  def change
    create_table :tab_picks do |t|
      t.integer :routeid
      t.text :name

      t.timestamps null: false
    end
  end
end
