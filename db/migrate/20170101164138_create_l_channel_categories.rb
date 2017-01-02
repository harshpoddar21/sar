class CreateLChannelCategories < ActiveRecord::Migration
  def change
    create_table :l_channel_categories do |t|
      t.text :name

      t.timestamps null: false
    end
  end
end
