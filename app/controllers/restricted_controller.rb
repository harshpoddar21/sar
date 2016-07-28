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

        bookingId=UmsBooking.placeBooking userId,3034,3014,831 if userId!=nil

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
end