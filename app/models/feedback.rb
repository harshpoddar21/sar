class Feedback < ActiveRecord::Base
  NO_OF_BOOKING_TILL_FEEDBACK_CALL_IS_MADE=1


  def self.initiateFeedbackForBookings bookingIds,channel

    bookings=UmsBooking.where("BOOKING_ID in ("+bookingIds.join(",")+")")

    bookings.each do |book|

      Feedback.create(:booking_id=>book["BOOKING_ID"],:channel=>channel,:time_sent=>Time.now.to_i)
      sendFeedbackIvrToUser(book["USER_ID"])
    end

  end

  class Channel
    VIA_CALL="call"

    VIA_SMS="sms"

  end

  def self.sendFeedbackIvrToUser userId

    user=UmsUser.find_by(:USER_ID=>userId)
    if user!=nil
      response=TelephonyManager.sendFeedbackIvrCall user["PHONE_NUMBER"]
      if response==nil || response!="OK"
        logger.error "Sending ivr call to "+user["PHONE_NUMBER"]+" has failed. Please check"
      end
    end
  end
end
