class BookingObserver




  def checkIfNewBookingHappened(routeIds)


    Rails.logger.info "Running cron in "+Rails.env.to_s

    if Session.getCurrentSessionType==Session::MORNING_SESSION
       @bookings=UmsBooking.where("ROUTE_ID in ("+routeIds.join(",")+")")
                     .where("CREATED_TIME<"+((Session.getMorningSessionEndUnixTime)*Constants::MILLISECONDS_IN_SECOND).to_s)
                     .where("CREATED_TIME>"+(Utils.getTodayMorningUnixTime * Constants::MILLISECONDS_IN_SECOND).to_s)
    else
      @bookings=UmsBooking.where("ROUTE_ID in ("+routeIds.join(",")+")")
                    .where("CREATED_TIME>"+((Session.getMorningSessionEndUnixTime())*Constants::MILLISECONDS_IN_SECOND).to_s)
    end

    if @bookings.length==0

      return "Returned with no booking"
    end
    @bookingsUserMap=Hash.new

    userIds=Array.new
    @bookings.each do |book|
      if !(userIds.include? book["USER_ID"])
        userIds.push book["USER_ID"]
      end
    end
    if userIds.length==0
      return
    end
    allBookings=UmsBooking.where("USER_ID in ("+userIds.join(",")+")").where("ROUTE_ID in ("+routeIds.join(",")+")")
    allBookings.each do |book|
      if @bookingsUserMap[book["USER_ID"]]==nil
        @bookingsUserMap[book["USER_ID"]]=Array.new
      end
      @bookingsUserMap[book["USER_ID"]].push book

    end

    sendWelcomeMessageToFirstBookingPeople
    sendFeedbackCallToNewUser
    return :text=>"Ran cron at "+Time.now.to_s

  end


  def sendFeedbackCallToNewUser


    currentTime=Time.now.to_i
    bookingIds=Array.new
    @bookings.each do |booking|

      if @bookingsUserMap[booking["USER_ID"]]==nil || @bookingsUserMap[booking["USER_ID"]].length>Feedback::NO_OF_BOOKING_TILL_FEEDBACK_CALL_IS_MADE
        next
      end

      if booking["CREATED_TIME"]/Constants::MILLISECONDS_IN_SECOND<currentTime-2*Constants::SECONDS_IN_HOUR
      #initiate call after 2 hrs of booking

        if Feedback.where(:booking_id => booking["BOOKING_ID"]).size==0

          bookingIds.push booking["BOOKING_ID"]
        end
      end

    end

    if bookingIds.length>0

      Feedback.initiateFeedbackForBookings(bookingIds,Feedback::Channel::VIA_CALL)
    end



    tabLeads=nil

    if Session.getCurrentSessionType==Session::MORNING_SESSION
      tabLeads=GetSuggestionViaTab.where("unix_timestamp(created_at)<"+(Session.getMorningSessionEndUnixTime).to_s)
                   .where("unix_timestamp(created_at)>"+(Utils.getTodayMorningUnixTime()).to_s)
                   .where(:make_booking=>1)
    else
      tabLeads=GetSuggestionViaTab.where("unix_timestamp(created_at)>"+(Session.getMorningSessionEndUnixTime).to_s)
                   .where(:make_booking=>1)
    end

    phoneNumbersToSend=Array.new

    tabLeads.each do |tabLead|

      if tabLead.created_at.to_i<currentTime-2*Constants::SECONDS_IN_HOUR

        if Feedback.where(:phone_number=>tabLead.customer_number).size==0
          phoneNumbersToSend.push tabLead.customer_number
        end

      end

    end

    if phoneNumbersToSend.length>0
      Feedback.initateFeedbackFromNewUserWithoutBookingId phoneNumbersToSend,"TAB"

    end

  end

  def sendWelcomeMessageToFirstBookingPeople


    @bookings.each do |booking|
      if @bookingsUserMap[booking["USER_ID"]]==nil || @bookingsUserMap[booking["USER_ID"]].length>1
        next
      end
      user=UmsUser.find_by(:USER_ID=>booking["USER_ID"])
      if user!=nil
        MessageTracker.sendMessage user["PHONE_NUMBER"],"Thanks for choosing Shuttl. We hope that your first ride with us is hassle free. However if you face any issue please call us at 9015122792 and let us know.",true,"booking/"+booking["BOOKING_ID"].to_s
      end
    end
  end



end