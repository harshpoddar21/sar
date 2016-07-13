class ChangeColumnBookingFlowPhoneNumberToText < ActiveRecord::Migration

    def change
      change_column(:booking_follows, :phone_number, :text)
    end

end
