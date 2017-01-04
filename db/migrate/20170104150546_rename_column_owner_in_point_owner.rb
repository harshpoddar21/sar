class RenameColumnOwnerInPointOwner < ActiveRecord::Migration
  def change

    rename_column :point_owners, :owner, :owner_phone_number
  end
end
