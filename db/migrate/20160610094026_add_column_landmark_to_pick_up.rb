class AddColumnLandmarkToPickUp < ActiveRecord::Migration
  def change
    add_column :pick_ups, :landmark, :text
  end
end
