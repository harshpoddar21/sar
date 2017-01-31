class RestrictedController < ApplicationController


  def getDetailsForLead

    phoneNumber=params[:caller]
    newLead=LLead.find_by(:phone_number=>phoneNumber)

    if newLead!=nil

      fromLocationName=newLead.from
      toLocationName=newLead.to


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



  def leadFeedbackReceived

    phoneNumber=params[:caller]
    response=params[:input]

    isSuccess=LLeadFeedback.createLeadFeedback phoneNumber,LLeadFeedback::Channel::VIA_CALL,response

    if !isSuccess
      logger.error "Cannot save feedback from caller "+phoneNumber.to_s+" and response "+response

    end

    render :text=>"OK"
  end
  def boardingRequestReceived

    phoneNumber=params[:caller]
    response=params[:input]

    isSuccess=BoardingIvrResponse.saveResponse phoneNumber,response

    if !isSuccess
      logger.error "Cannot save boarding from caller "+phoneNumber.to_s+" and response "+response

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

      PtCustomerResponse.create(:phone_number=>phoneNumber,:response=>keypress.to_i)
    end
    render :text=>"ok"

  end

  def sendIVRCall
    numbers=[8800846150,9958211222,9716850945,9818682547,9717145195,9999405056,9868305541,8802305914,9958683436,9971994145,9599666188,9811822937,9555185967,9818186756,9873352597,9953302391,9711446473,9717883388,9971960767,8228045670,9911211152,9899299824,9717820728,9560527810,9910740424,9560555406,9818470506,9873662535,9999038653,9650495400,9540244168,9880710575,9810105035,9810210374,9650077380,8527171180,9599589525,7042925544,9891390462,9999969227,9873501972,9810597679,8586089988,9716613705,9811534978,9899168626,9871413128,9990088868,9811791675,9891470367,8587827828,8527025994,9958456233,9027247648,7503630443,9884353336,9483512166,9789012546,98110069,9666304613,9999800246,9008701005,9818416020,9968502743,9650805222,9899034411,9958555376,9999832325,9873205137,9999231675,9811947751,7042500205,9811404611,9999312988,9911572765,9582044299,7065873977,9650360673,9891828328,8800566456,7042912626,9960670401,9873460882,7875282233,9971837678,9717820696,9810405556,9654226937,8800395588,9013689856,9953825088,9999034020,9716950358,9717947382,9818505105,9560729379,9873322007,9818588899,9213975400,9716481894,9711494532,9871716211,9911011411,9560663505,8800114483,9811464618,9990276236,9871205158,8882541845,9818925455,9810482979,9958698985,9891705015,9873629081,9958300278,9953593665,9212933776,9999675938,9899886176,9818282115,8510849090,9717699992,8587825499,9999483762,9811292840,8586008582,9953480798,9911152447,9704829995,9818622607,9999370528,9654737616,9810965019,9599500729,9718582555,9650522005,7531031963,9911624469,9999425642,9810116655,9711161056,8376912111,9910038144,9820402507,9999363795,7503093313,9873885856,8287574838,9971797202,9582865831,8376903443,9899741756,9718484185,9971232605,8585914566,9958666952,9899509601,9811325721,9899298236,9654729490,8447058447,9871119887,9958266466,9643349036,9910058590,9873337635,9999082845,9560193053,9654179776,9716486213,9810800208,7042855244,8767557727,8755412439,9650292351,9810213203,9818885892,9818175368,9811153224,9540428882,9818300726,9911322376,9810244468,8800995963,8285330006,7894414436,9717291616,9313043911,9967100741,9990914554,9958095080,9953150782,9711747088,8527118464,9891386624,9958707991,8882611615,9899260898,9811856516,9971127709,8800676263,8527886637,9958730177,9582841106,9582232635,8826544665,9999817227,9999387330,9958295532,9810845611,9871405252,8130790512,9599015625,9711022503,9013633400,9650705552,9810731707,9811413462,9840300623,9136003481,9910163112,9911365223,9818281635,9560562424,8447215389,9871524017,9711466810,9013377739,8126477097,9910150123,9999990276,8826249853,8826433709,9958897558,7011075910,9717665268,9871119729,9873854782,9953084556,9049009869,9711362386,9599928249,8800094872,8130022260,8527331113,9910864222,8800490201,9999678951,9911149002,8587868009,9654831461,9717868854,9899028024,9899116418,9899455695,9910460273,9654050540,9999404250,9599085849,9717991888,9958780044,9891402291,9953908240,9971726973,8882660410,9873371209,8527567620,9910009241,8468826166,9910714425,9560983523,8376062584,9810904959,8802392526,8800900543
    ]


    ivrCode="13443"
    numbers.each do |number|

      TelephonyManager.sendIvrCallTo ivrCode,number.to_s

    end

  end


  def autoBookingReceived

    phoneNumber=params[:from]
    message=params[:message]
    if message!=nil
      bookingId=message[/\d+/]
      if bookingId=="101"

        if !(AutoBooking.find_by_booking_id bookingId)

          AutoBooking.create(:booking_id=>bookingId,:phone_number=>phoneNumber)
          TelephonyManager.sendSms phoneNumber,"Congratulations!! You have been registered as Shuttl Certified Auto. If you have any query you can call us at 9015122792."
        else

          TelephonyManager.sendSms phoneNumber,"You are already registered as Shuttl Certified Auto."
        end

      elsif bookingId!=nil

        if !(AutoBooking.find_by_booking_id bookingId)
          TelephonyManager.sendSms phoneNumber,"Your boarding request #{bookingId} has been recorded. We thank you for being a valuable Shuttl Partner. If you have any query you can call us at 9015122792"
          AutoBooking.create(:booking_id=>bookingId,:phone_number=>phoneNumber)
        else

          TelephonyManager.sendSms phoneNumber,"This boarding request is already recorded with us."
        end

      else
        TelephonyManager.sendSms phoneNumber,"Invalid booking id. If you have any query please call on 9015122792."
      end
    else
      TelephonyManager.sendSms phoneNumber,"Invalid Message. If you have any query please call on 9015122792."
    end


    render :text=>"OK"
  end



end