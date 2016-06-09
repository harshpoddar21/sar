class AddColumnDeletedToRouteExist < ActiveRecord::Migration
  def change
    add_column :route_exists, :deleted, :integer
  end
end
