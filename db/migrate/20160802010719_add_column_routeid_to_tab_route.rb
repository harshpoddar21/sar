class AddColumnRouteidToTabRoute < ActiveRecord::Migration
  def change
    add_column :tab_routes, :routeid, :integer
  end
end
