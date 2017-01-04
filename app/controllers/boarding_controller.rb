class BoardingController < ApplicationController

  def getBoardingDetails

    data=params[:data]
    response=Hash.new
    decodedValue=Utils.decodeBase64Generated data
    if decodedValue.length==6
      response["success"]=true
      response["data"]=getParametersFromDataField data
      bookingButtons=Array.new
      if Utils.getTodayMorningUnixTime+11*3600>Time.now.to_i
        bookingButtons.push({"unixTime"=>Time.now.to_i+300,"label"=>"Today morning"})
        bookingButtons.push({"unixTime"=>Time.now.to_i+17*3600,"label"=>"Today evening"})
      else
        bookingButtons.push({:unixTime=>Time.now.to_i+17*3600,:label=>"Today evening"})
        bookingButtons.push({:unixTime=>Time.now.to_i+31.5*3600,:label=>"Tomorrow morning"})
      end
      response["bookingButtons"]=bookingButtons
    else
      response["success"]=false
    end
    puts response

    render :json=>response.to_json
  end


  def submitBoarding

    phoneNumber=params["result"]["data"]["phoneNumber"]
    requestedBoardingTime=params["optionSelected"]
    from=params["result"]["data"]["from"]
    to=params["result"]["data"]["to"]
    channelCategoryId=params["result"]["data"]["channelCategoryId"]
    channelId=params["result"]["data"]["channelId"]
    campaignId=params["result"]["data"]["campaignId"]

    response=Hash.new

    if phoneNumber!=nil && requestedBoardingTime!=nil && from!=nil && to!=nil && channelCategoryId!=nil && channelId!=nil && campaignId!=nil
      boarding=BoardingRequest.create(:phone_number=>phoneNumber,:requested_boarding_time=>requestedBoardingTime,:from=>from,:to=>to,:channel_category_id=>channelCategoryId,:channel_id=>channelId,:campaign_id=>campaignId)
      response[:success]=true
      TelephonyManager.sendSms phoneNumber,"Your Shuttl booking id is #{123043+boarding.id}. Please show this booking id to driver to board the Shuttl. You may also call on 01133147040 for any assistance required to board the Shuttl."
      TelephonyManager.sendSms phoneNumber,"01133147040"
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

end