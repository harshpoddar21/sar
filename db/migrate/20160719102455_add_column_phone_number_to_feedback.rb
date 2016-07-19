class AddColumnPhoneNumberToFeedback < ActiveRecord::Migration
  def change
    add_column :feedbacks, :phone_number, :text
  end
end
