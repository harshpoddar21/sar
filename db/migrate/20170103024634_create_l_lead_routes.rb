class CreateLLeadRoutes < ActiveRecord::Migration
  def change
    create_table :l_lead_routes do |t|
      t.integer :route_id

      t.timestamps null: false
    end
  end
end
