class CreatePickUpPointClusterMappings < ActiveRecord::Migration
  def change
    create_table :pick_up_point_cluster_mappings do |t|
      t.text :name
      t.integer :from_id
      t.text :cluster

      t.timestamps null: false
    end
  end
end
