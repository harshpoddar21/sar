class CustomercareController < ApplicationController


  def getData

    if !params[:fromDate] || !params[:toDate]
      render :json=>Response.new(false).to_json
      return
    end
    fromDate=params[:fromDate]
    toDate=params[:toDate]
    routeid=params[:routeid]

    leads=Array.new
    if fromDate!=nil && toDate!=nil && routeid!=nil

      customers=GetSuggestionViaTab.where("unix_timestamp(created_at)>=#{fromDate} and unix_timestamp(created_at)<=#{toDate}").where("routeid"=>routeid)
      customers.each do |cust|
        leads.push NewLead.loadOrCreateByCustomer cust,"TAB"
      end

      customers=RouteSuggestionCombined.where("unix_timestamp(DATE_CREATED)>=#{fromDate} and unix_timestamp(DATE_CREATED)<=#{toDate}").where("ROUTE_ID in (831,832,64)")
      customers.each do |cust|
        leads.push NewLead.loadOrCreateByCustomer cust,cust.channel
      end

      customers=CustomerSuggestion.where("unix_timestamp('created_at')>=#{fromDate} and unix_timestamp(created_at)<=#{toDate}").where("routeid in (831,832,64)")
      customers.each do |cust|
        leads.push NewLead.loadOrCreateByCustomer cust,"myor"
      end






    end

    render :json=>Response.new(true,leads).to_json

  end


  def update_lead_data
    key=params[:key]
    value=params[:value]
    phoneNumber=params[:phone_number]

    if key==nil || value==nil || phoneNumber==nil
      raise CustomError::ParamsException,"Invalid Input"
    end

    if key=="called"
      NewLead.changeCalledStatus phoneNumber,value
    elsif key=="interested"
      NewLead.changeInterestedStatus phoneNumber,value
    elsif key=="response"
      NewLead.changeResponse phoneNumber,value
    else
      raise Exception,"Invalid Key"
    end

    render :json=>Response.new(true,{}).to_json
  end

  def sendSMS
    content=params[:content]
    pLink=params[:pLink]
    nLink=params[:nLink]
    phoneNumber=params[:phone_number]
    lead=NewLead.find_by(:phone_number=>phoneNumber)

    if content!=nil && lead!=nil
      urlSh=UrlShortener.create(:new_lead_id=>lead.id,:p_link=>pLink,:n_link=>nLink)

      content.gsub! "{pLink}",urlSh.getPositiveLinkShortened if pLink!=nil
      content.gsub! "{nLink}",urlSh.getNegativeLinkShortened if nLink!=nil
      NewLead.sendSms phoneNumber,content
    end


    render :json=>Response.new(true,{}).to_json
  end


  def getBookingDetails

    fromDate=params[:fromDate]
    toDate=params[:toDate]

    routeIds=params[:route_ids]
    if (routeIds==nil)
      routeIds="831,832,586,587"
    end
    bookings=UmsBooking.where("ROUTE_ID in (#{routeIds})").where(:is_delete=>false).joins(" join USERS on BOOKINGS.USER_ID=USERS.USER_ID").select("BOOKINGS.*,USERS.*")


    userBookings=Hash.new

    bookingFollowA=Hash.new
    BookingFollow.all.each do |bo|
      bookingFollowA[bo.booking_id]=bo
    end

    allBookingIds=Array.new
    bookings.each do |boo|

      allBookingIds.push boo["BOOKING_ID"]
    end



    bookingIdFeedback=Hash.new

    if allBookingIds.length>0
      feedbacks=Feedback.where("booking_id in ("+allBookingIds.join(",")+")")

      feedbacks.each do |feedback|

        bookingIdFeedback[feedback.booking_id]=feedback.response

      end
    end

    bookings.each do |booking|


      if userBookings[booking["USER_ID"]]==nil

        userBookings[booking["USER_ID"]]=Array.new

      end

      boo=Hash.new

      booking.attributes.each do |key,value|

        boo[key]=value

      end
      bFlow=bookingFollowA[boo["BOOKING_ID"]]

      boo["called"]=bFlow==nil ? "No": bFlow.called==nil ? "No" : bFlow.called
      boo["response"]=bFlow==nil ? "" : bFlow.response
      boo["TRIP_RATING"]=bookingIdFeedback[boo["BOOKING_ID"]]==nil ? 0 : bookingIdFeedback[boo["BOOKING_ID"]]

      userBookings[booking["USER_ID"]].push boo

    end

    render :json=>userBookings

  end


  def updateKeyValueForBooking

    key=params[:key]
    value=params[:value]
    bookingId=params[:booking_id]
    if key==nil || value == nil || bookingId==nil
      throw CustomError::ParamsException,"Invalid parameters"
    else

      if key== "called"

        BookingFollow.changeCalledStatusForBookingId bookingId,value
      elsif key=="response"
        BookingFollow.changeResponseForBookingId bookingId,value
      else

      end

    end


    render :json=>Response.new(true,{}).to_json

  end

  def sendSmsForBooking
    content=params[:content]
    pLink=params[:pLink]
    nLink=params[:nLink]
    bookingId=params[:booking_id]
    if content!=nil && bookingId!=nil
      urlSh=UrlShortenerBooking.create(:booking_id=>bookingId,:p_link=>pLink,:n_link=>nLink)

      content.gsub! "{pLink}",urlSh.getPositiveLinkShortened if pLink!=nil
      content.gsub! "{nLink}",urlSh.getNegativeLinkShortened if nLink!=nil
      BookingFollow.sendSms bookingId,content
    end


    render :json=>Response.new(true,{}).to_json


  end


end



