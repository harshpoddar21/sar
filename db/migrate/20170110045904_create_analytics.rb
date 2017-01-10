class CreateAnalytics < ActiveRecord::Migration
  def change
    create_table :analytics do |t|
      t.text :key
      t.text :value

      t.timestamps null: false
    end
  end
end
