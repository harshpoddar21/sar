class CreateFeedbacks < ActiveRecord::Migration
  def change
    create_table :feedbacks do |t|
      t.integer :booking_id
      t.text :channel
      t.integer :time_sent
      t.integer :time_responded
      t.text :response

      t.timestamps null: false
    end
  end
end
