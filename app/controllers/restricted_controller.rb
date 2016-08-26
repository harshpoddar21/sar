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
        7838274913,
        9540280650,
        8527025994,
        9871405252,
        9958456233,
        9027247648,
        7503630443,
        9999817227,
        8130790512,
        9884353336,
        8860788084,
        9990018618,
        9818300726,
        9999011486,
        8826126819,
        9871324325,
        8130790512,
        9990073254,
        9650824848,
        9818437560,
        9953187508,
        9483512166,
        9789012546,
        98110069,
        9666304613,
        9582214880,
        9999800246,
        9008701005,
        9582841106,
        9811791675,
        9958211222,
        9958211222,
        9871276998,
        8527363640,
        9711020553,
        8373908820,
        9716850945,
        9810240617,
        9560429817,
        9650597665,
        9650597665,
        9971125244,
        9717077950,
        8826534716,
        9910146365,
        9958628354,
        9999099403,
        9560841428,
        9716850945,
        9818682547,
        9810240617,
        8800222133,
        9650597665,
        9650597665,
        9717145195,
        9999405056,
        9560825099,
        9582232635,
        9910146365,
        9818807303,
        8010241689,
        9650360673,
        9650360673,
        9899887612,
        9899887612,
        9015071744,
        9015071744,
        9811777828,
        9971232605,
        7838513139,
        7838513139,
        9818682547,
        9810240617,
        9899072702,
        9953089149,
        9953089149,
        7503009797,
        7503009797,
        9582232635,
        9868305541,
        9910146365,
        9873660196,
        9899887612,
        9899887612,
        7838513139,
        7838513139,
        9958111527,
        9899072702,
        9717145195,
        8587003305,
        8587003305,
        9868305541,
        9899887612,
        9899887612,
        9811418243,
        9971319094,
        9971319094,
        8527062586,
        7838513139,
        7838513139,
        9871008338,
        9871008338,
        9899072702,
        9999405056,
        7042788908,
        9811308232,
        9650136707,
        9868305541,
        9899034411,
        9899034411,
        9752749978,
        9811418243,
        7599120719,
        7599120719,
        8826544665,
        9899369267,
        8285259328,
        8285259328,
        9818653654,
        9818653654,
        8171806395,
        8171806395,
        8295863547,
        8295863547,
        9891529062,
        9891529062,
        9958211222,
        9958211222,
        8800631857,
        8800631857,
        7599120719,
        7599120719,
        9999817227,
        9811510700,
        9560185848,
        8285259328,
        8285259328,
        7838363690,
        9650827153,
        9811308232,
        8447202106,
        8447202106,
        8882993710,
        9871100604,
        9582232635,
        9958211222,
        9958211222,
        8800631857,
        8800631857,
        9999817227,
        8585914566,
        8424024250,
        9560185848,
        8285259328,
        8285259328,
        7838363690,
        8802305914,
        9818857623,
        9818857623,
        9811308232,
        8447202106,
        8447202106,
        9582232635,
        9958211222,
        9958211222,
        8800631857,
        8800631857,
        9999817227,
        8585914566,
        9818574012,
        9990073254,
        9990073254,
        8826788488,
        8826788488,
        7838363690,
        8802305914,
        9999405056,
        9654937083,
        9811308232,
        9891470367,
        9582232635,
        9958211222,
        9958211222,
        9958683436,
        9999817227,
        9643268496,
        9643268496,
        9540428882,
        9968534464,
        9968534464,
        7838769999,
        9455861215,
        9455861215,
        8130060513,
        8802305914,
        9999850790,
        9999850790,
        9654937083,
        9811308232,
        9871100604,
        9891470367,
        9958211222,
        9958211222,
        9999817227,
        9540428882,
        9968534464,
        9968534464,
        9810845611,
        9999719434,
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
end