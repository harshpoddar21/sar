class CreateTimestampSuggests < ActiveRecord::Migration
  def change
    create_table :timestamp_suggests do |t|
      t.integer :routeid
      t.integer :fromtime
      t.integer :totime
      t.integer :interval

      t.timestamps null: false
    end
  end
end
