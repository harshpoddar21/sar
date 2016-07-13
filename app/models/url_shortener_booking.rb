class UrlShortenerBooking < ActiveRecord::Base


  def getPositiveLinkShortened


    "https://myor.shuttl.com/b/"+self.id.to_s+"/1"


  end


  def getNegativeLinkShortened


    "https://myor.shuttl.com/b/"+self.id.to_s+"/2"

  end

  def negativeLinkClicked

    booking=BookingFollow.find_by(:booking_id=>self.booking_id)
    if booking==nil
      raise Exception,"Something bad has happened"
    end
    booking.count_clicked_on_negative=booking.count_clicked_on_negative==nil ? 1 : booking.count_clicked_on_negative+1
    booking.save

  end


  def positiveLinkClicked

    booking=BookingFollow.find_by(:booking_id=>self.booking_id)
    if booking==nil
      raise Exception,"Something bad has happened"
    end
    booking.count_clicked_on_positive=booking.count_clicked_on_positive==nil ? 1 : booking.count_clicked_on_positive+1
    booking.save

  end

end
