class RestrictedController < ApplicationController


  def getDetailsForLead

    phoneNumber=params[:caller]
    newLead=GetSuggestionViaTab.find_by(:customer_number=>phoneNumber)

    if newLead!=nil

      fromLocationName=newLead.from_str
      toLocationName=newLead.to_str


      render :text=>"200|from={say:#{fromLocationName}};to={say:#{toLocationName}}"
    else
      logger.info "Get details for lead "+phoneNumber+" entry not found"
      render :text=>"NOT OK"
    end



  end

  def responseReceived

    phoneNumber=params[:caller]

    response=params[:input]

    sugg=GetSuggestionViaTab.where(:customer_number => phoneNumber).last

    if phoneNumber!=nil && response!=nil && sugg!=nil
      sugg.fraud_detector=response.to_i
      sugg.save
      if response==1.to_s

        if sugg.make_booking!=1
          raise Exception,"Invalid Make booking received for phoneNumber"+phoneNumber
        end
        user=UmsUser.where("PHONE_NUMBER="+phoneNumber).last
        userId=nil
        bookingId=nil

        if user!=nil
          userId=user["USER_ID"]
          userId=UmsUser.encryptUserId userId

        else
          status,userId=UmsUser.createNewUserUms phoneNumber,UmsUser::UserType::TAB_NEW_USER
        end

        bookingId=UmsBooking.placeBooking userId,sugg.from_id,sugg.to_id,sugg.routeid if userId!=nil

        if bookingId==nil
          bookingId="SUGG"+sugg.id.to_s
        end
        TelephonyManager.sendSms phoneNumber,"We are excited that you have decided to try Shuttl for your office commute. Your booking id is #{bookingId} .We hope that your travel with us is hassle free."
      end
    else
      logger.info "Invalid params  or no sugg "+phoneNumber+"input:"+response
    end

    render :text=>"OK"
  end


  def feedbackReceived

    phoneNumber=params[:caller]
    response=params[:input]

    isSuccess=Feedback.recordResponseFromUser phoneNumber,Feedback::Channel::VIA_CALL,response

    if !isSuccess
      logger.error "Cannot save feedback from caller "+phoneNumber.to_s+" and response "+response

    end

    render :text=>"OK"
  end


  def makeEveningIvrCall

    alreadyResponded=Array.new
    peopleBooked=UmsBooking.where("ROUTE_ID in (831,832,587)").joins(" join USERS on BOOKINGS.USER_ID=USERS.USER_ID").select(:PHONE_NUMBER).map(&:PHONE_NUMBER).uniq
    responded=EveningTime.all.select(:phone_number).map(&:phone_number).uniq
    leftPeople=peopleBooked-responded
    leftPeople.each do |phoneNumber|
      ConnectionManager.makeHttpRequest "http://obd.solutionsinfini.com/api/v1/index.php?api_key=A08c15a6f74423b20addc4ab5dc2fdedb&method=voice.call&play=12701.ivr&numbers=#{phoneNumber}&format=xml"
    end

    render :text=> "OK"
  end

  def eveningTime

    phoneNumber=params[:caller]
    time=params[:keypress]
    EveningTime.create(:phone_number=>phoneNumber,:evening_time=>time)
    render :text=>"OK"
  end

  def getEveningTime

    alreadyResponded=Array.new


    sendToAll=params[:sendToAll]

    peopleBooked=UmsBooking.where("ROUTE_ID in (831,832,587)").joins(" join USERS on BOOKINGS.USER_ID=USERS.USER_ID").select(:PHONE_NUMBER).map(&:PHONE_NUMBER).uniq
    responded=EveningTime.all.select(:phone_number).map(&:phone_number).uniq
    leftPeople=peopleBooked-responded
    leftPeople.each do |phoneNumber|
      if sendToAll==1.to_s || phoneNumber.to_s=="8800846150"
      shortenUrl=BitlyUtils.shortenUrl "https://docs.google.com/forms/d/e/1FAIpQLSejTN9XPYBgCRosC8WAkWP2lw5SeUo_yXwnYSUi14kuGQ_rXg/viewform?entry.1826517929=#{phoneNumber}"
      TelephonyManager.sendSms phoneNumber,"To run a Shuttl back to your home at your preferred time go to: #{shortenUrl}"
      end
    end
  end

  def getDecryptedUserId

    userid=UmsUser.decryptUserId(params[:userid])
    user=Hash.new


    user["user_id"]=userid
    render :xml=>user.to_xml
  end

  def getRoutePointsForAllRoutes

    polyLine=Array.new

    RouteSuggest.each do |route|

      polyLine.push Polylines::Decoder.decode_polyline(route.overviewPolyline)

    end

    @routes=polyLine
  end

  def sendMessage
    message="⁠Shuttl launches its next line on East Delhi/Noida to Gurgaon. Route starts from Noida Sector 16 and goes via Sector 15, Ashok Nagar, Mayur Vihar, IP Extension, Patparganj and goes till CyberCity and Sikanderpur. Click on  http://bit.ly/2bXJXRL to know more and book your Shuttl in evening or call us on 8447208301 for any concerns."
    numbers=[
        8587827828,
        9716675123,
        8860909485,
        8130947637,
        8130737777
    ]
    numbers.each do |number|
      TelephonyManager.sendSms number,URI.encode(message)
    end

  end

  def getRoutePoints
    points=[
        {"lat"=>28.578697,"lng"=>77.317375},
            {"lat"=>28.584953,"lng"=>77.311539},
            {"lat"=>28.589173,"lng"=>77.308792},
            {"lat"=>28.592791,"lng"=>77.294459},
            {"lat"=>28.59453,"lng"=>77.302295},
            {"lat"=>28.616711,"lng"=>77.318067},
            {"lat"=>28.62442,"lng"=>77.303263},
            {"lat"=>28.61327,"lng"=>77.282833},
            {"lat"=>28.498231,"lng"=>77.089046}
    ]
    dir=GoogleDirection.new(points)
    dir.execute
    allpoints=dir.overviewPolyline
    puts allpoints
    allpoints=Polylines::Decoder.decode_polyline allpoints
    allpoints
  end

  def ptCustomerResponse

    phoneNumber=params[:phone_number]
    keypress=params[:keypress]
    if phoneNumber!=nil && keypress!=nil

      PtCustomerResponse.create(:phone_number=>phoneNumber,:response=>response)
    end
    render :text=>"ok"

  end

  def sendIVRCall
    numbers=[8800846150]
    ivrCode="13407"
    numbers.each do |number|

      TelephonyManager.sendIvrCallTo ivrCode,number.to_s

    end
  end
end