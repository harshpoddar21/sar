class BookingFollow < ActiveRecord::Base


  def self.changeCalledStatusForBookingId bookingId,called

    booking=BookingFollow.find_by(:booking_id=>bookingId)

    if booking==nil
      booking=BookingFollow.new
      booking.booking_id=bookingId
    end
    booking.called=called
    booking.save
  end

  def self.changeResponseForBookingId bookingId,response


    booking=BookingFollow.find_by(:booking_id=>bookingId)

    if booking==nil
      booking=BookingFollow.new
      booking.booking_id=bookingId
    end

    booking.response=response
    booking.save

  end



  def self.sendSms bookingId,message

    booking=BookingFollow.find_by(:booking_id=>bookingId)

    if booking==nil

      booking=BookingFollow.new
      booking.booking_id=bookingId

    end

      booking.count_link_sent=booking.count_link_sent==nil ? 1 : booking.count_link_sent+1
      booking.save
      phoneNumber=booking.phone_number
      if booking.phone_number==nil
        book=UmsBooking.where(:BOOKING_ID=>bookingId).joins(" join USERS on BOOKINGS.USER_ID=USERS.USER_ID").select("USERS.*")
        if book!=nil && book.size>0
          phoneNumber=book.first["PHONE_NUMBER"]
          booking.phone_number=phoneNumber
          booking.save
        end
      end

      if phoneNumber!=nil
        TelephonyManager.sendSms phoneNumber,message
      end

  end

end
