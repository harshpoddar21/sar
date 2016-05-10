class CreateTimestamps < ActiveRecord::Migration
  def change
    create_table :timestamps do |t|
      t.datetime :fromtime
      t.datetime :totime
      t.integer :interval
      t.integer :deleted

      t.timestamps null: false
    end
  end
end
