class CreateLNewLeadCampaigns < ActiveRecord::Migration
  def change
    create_table :l_new_lead_campaigns do |t|
      t.text :name
      t.text :description

      t.timestamps null: false
    end
  end
end
