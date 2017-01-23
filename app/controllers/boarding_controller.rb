class BoardingController < ApplicationController

  def getBoardingDetails




    currentTime=Time.now.to_i
    data=params[:data]
    response=Hash.new
    decodedValue=Utils.decodeBase64Generated data
    if decodedValue.length==6
      response["success"]=true
      response["data"]=getParametersFromDataField data
      sessions=Array.new


      if Time.at(currentTime).wday!=0 && Time.at(currentTime).wday!=6
        if (Utils.getTodayMorningUnixTime+11*3600)>currentTime
          a={:label=>"Today Morning"}
          a[:slots]=Array.new

          firstTime= currentTime>(Utils.getTodayMorningUnixTime+7*3600) ? currentTime:Utils.getTodayMorningUnixTime+7*3600

          lastTime=Utils.getTodayMorningUnixTime+11*3600

          (firstTime..lastTime).step(900).each do |time|
            a[:slots].push({:unixTime=>time,:label=>Time.at(time+5*3600+1800).strftime("%H:%M")})
          end
          sessions.push(a)
          a={:label=>"Today Evening"}
          a[:slots]=Array.new

          firstTime=Utils.getTodayMorningUnixTime+16*3600
          lastTime=Utils.getTodayMorningUnixTime+20*3600
          ((firstTime)..lastTime).step(900).each do |time|
            a[:slots].push({:unixTime=>time,:label=>Time.at(time+5*3600+1800).strftime("%H:%M")})
          end
          sessions.push a
        else
          a={:label=>"Today Evening"}
          a[:slots]=Array.new
          firstTime= currentTime>(Utils.getTodayMorningUnixTime+16*3600) ? currentTime:Utils.getTodayMorningUnixTime+16*3600
          lastTime=Utils.getTodayMorningUnixTime+20*3600
          (firstTime..lastTime).step(900).each do |time|
            a[:slots].push({:unixTime=>time,:label=>Time.at(time+5*3600+1800).strftime("%H:%M")})
          end
          sessions.push(a)
          a={:label=>"Tomorrow Morning"}
          a[:slots]=Array.new

          lastTime=Utils.getTodayMorningUnixTime+11*3600+86400
          (((Utils.getTodayMorningUnixTime+7*3600+86400))..lastTime).step(600).each do |time|
            a[:slots].push({:unixTime=>time,:label=>Time.at(time+5*3600+1800).strftime("%H:%M")})
          end
          sessions.push(a)
        end
      else

        a={:label=>"Monday Morning"}
        a[:slots]=Array.new
        deltaDay=Time.at(currentTime).wday==0 ? 1:2

        lastTime=Utils.getTodayMorningUnixTime+deltaDay*86400+11*3600
        firstTime=Utils.getTodayMorningUnixTime+deltaDay*86400+7*3600
        (firstTime..lastTime).step(900).each do |time|
          a[:slots].push({:unixTime=>time,:label=>Time.at(time+5*3600+1800).strftime("%H:%M")})
        end
        sessions.push(a)
        a={:label=>"Monday Evening"}
        a[:slots]=Array.new

        lastTime=Utils.getTodayMorningUnixTime+deltaDay*86400+20*3600
        firstTime=Utils.getTodayMorningUnixTime+deltaDay*86400+16*3600
        (firstTime..lastTime).step(900).each do |time|
          a[:slots].push({:unixTime=>time,:label=>Time.at(time+5*3600+1800).strftime("%H:%M")})
        end
        sessions.push(a)

      end

      response["sessions"]=sessions
    else
      response["success"]=false
    end
    puts response

    render :json=>response.to_json
  end


  def submitBoardingMessage

    data=params[:data]

    if data!=nil

      data.each do |boardingMessage|

        from=boardingMessage["From"]
        to=boardingMessage["To"]
        message=boardingMessage["Message"]

        if from==nil || to==nil || message==nil
          raise CustomError::ParamsException,"Invalid Params"
        end
        BoardingSmsCampaignMessage.insertMessage from,to,message
      end

    end

    render :text=>"OK"

  end


  def submitBoarding

    phoneNumber=params["result"]["data"]["phoneNumber"]
    requestedBoardingTime=params["timeSlotSelected"]
    from=params["result"]["data"]["from"]
    to=params["result"]["data"]["to"]
    channelCategoryId=params["result"]["data"]["channelCategoryId"]
    channelId=params["result"]["data"]["channelId"]
    campaignId=params["result"]["data"]["campaignId"]

    response=Hash.new

    if phoneNumber!=nil && requestedBoardingTime!=nil && from!=nil && to!=nil && channelCategoryId!=nil && channelId!=nil && campaignId!=nil



      BoardingCampaign.createBoardingRequest phoneNumber,requestedBoardingTime,from,to,channelCategoryId,channelId,campaignId
      response[:success]=true


    else
      response[:success]=false
    end

    render :json=>response.to_json

  end

  def unsubscribe

    if params[:data]!=nil

      details=getParametersFromDataField(params[:data])
      if details!=nil

        LUnsubscribe.createIssueForLead details["phoneNumber"],"unsubscribed_by_user",details["channel_category_id"],details["channel_id"],details["campaign_id"]


      end
    end


    render :json=>{:success=>true}

  end


  def getParametersFromDataField data
    decodedValue=Utils.decodeBase64Generated data

    a=Hash.new
    a["from"]=decodedValue[0]
    a["to"]=decodedValue[1]
    a["channelCategoryId"]=decodedValue[2]
    a["channelId"]=decodedValue[3]
    a["campaignId"]=decodedValue[4]
    a["phoneNumber"]=decodedValue[5]
    a

  end

  after_filter  :set_access_control_headers


  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
  end


  def assistBoarding

    phoneNumber=params[:clid]

    lead=LLead.find_by_phone_number phoneNumber
    owner=nil
    from=nil
    to=nil
    routeId=nil


    if lead!=nil

      owner=PointOwner.find_by_from lead.from ? lead.from : "default"
      if owner==nil
        owner=PointOwner.find_by_from "default"
      end
      from= lead.from
      to=lead.to
      routeId=lead.route_id


    else

      owner=PointOwner.find_by_from "default"
    end


    message=""
    BoardingAssistance.create(:lead_phone_number=>phoneNumber,:from=>from,:owner_phone_number=>owner.owner_phone_number,:route_id=>routeId)
    if from!=nil && to!=nil

      message="Please call customer at #{phoneNumber} going from #{from} to #{to}"
    elsif routeId!=nil

      message="Please call customer at #{phoneNumber} going on route #{routeId}"
    else

      message="Please call customer at #{phoneNumber}"

    end

    TelephonyManager.sendSms owner.owner_phone_number,message
    TelephonyManager.sendSms phoneNumber,"Thank you for contacing Shuttl. You will get a callback from our side in next 10 mins."

    render :text=>"OK"

  end


  def sendBoardingIVRRequest

    BoardingCampaign.boardingIVRCampaign

  end




end