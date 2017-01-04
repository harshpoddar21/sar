class RenameColumnOwnerInBoardingAssistances < ActiveRecord::Migration
  def change


    rename_column :boarding_assistances, :phone_number, :owner_phone_number
  end
end
