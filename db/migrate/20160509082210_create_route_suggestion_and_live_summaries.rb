class CreateRouteSuggestionAndLiveSummaries < ActiveRecord::Migration
  def change
    create_table :route_suggestion_and_live_summaries do |t|
      t.integer :route_type
      t.integer :routeid
      t.integer :timeslot
      t.integer :people_interested

      t.timestamps null: false
    end
  end
end
