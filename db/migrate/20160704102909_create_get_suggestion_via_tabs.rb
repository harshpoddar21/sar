class CreateGetSuggestionViaTabs < ActiveRecord::Migration
  def change
    create_table :get_suggestion_via_tabs do |t|
      t.text :customer_number
      t.text :from_str
      t.text :from_mode
      t.text :to_mode
      t.text :from_time
      t.text :to_time
      t.integer :routeid
      t.integer :route_type

      t.timestamps null: false
    end
  end
end
