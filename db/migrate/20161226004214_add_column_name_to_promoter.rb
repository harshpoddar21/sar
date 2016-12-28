class AddColumnNameToPromoter < ActiveRecord::Migration
  def change
    add_column :promoters, :name, :text
  end
end
