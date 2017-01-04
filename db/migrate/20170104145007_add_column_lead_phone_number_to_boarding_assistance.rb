class AddColumnLeadPhoneNumberToBoardingAssistance < ActiveRecord::Migration
  def change
    add_column :boarding_assistances, :lead_phone_number, :text
  end
end
