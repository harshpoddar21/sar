class CreateDeadBetweenPoints < ActiveRecord::Migration
  def change
    create_table :dead_between_points do |t|
      t.text :start_point
      t.text :end_point
      t.integer :eta
      t.integer :distance
      t.integer :departure_time

      t.timestamps null: false
    end
  end
end
