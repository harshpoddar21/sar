class SuggestController < ApplicationController

  def getFromTo
  
  end

  def index

  end
  def getSlots

    path=params[:path]
    if path==nil
      redirect_to :controller=>:error,action=>:oops
      return
    end

    paths=Polylines::Decoder.decode_polyline(path)
    if paths==nil || paths.size !=2

      redirect_to :controller=>:error,action=>:oops
      return
    end
    origin=paths[0]
    destination=paths[1]
    route=Route::getRouteBetween(origin,destination)
    result=Hash.new
    originLoc=Hash.new
    destinationLoc=Hash.new

    if route!=nil
       originLoc["lat"]=origin[0]
       originLoc["lng"]=origin[1]
       destinationLoc["lat"]=destination[0]
       destinationLoc["lng"]=destination[1]
       result["slots"] = route.getSlots
       result["pricing"]=route.pricing
       result["origin"]=originLoc
       result["route_id"]=route.id
       result["destination"]=destinationLoc
       result["route_type"]=route.routeType
       result["points"]=route.routePoints
      if (route.routeType==Route::SUGGESTED_ROUTE)
        result["pick"]=PickUp.where(:routeid=>route.id)
      elsif route.routeType==Route::LIVE_ROUTE
        result["pick"]=Slot.where(:routeid=>route.id).joins("join locations on slots.locationid=locations.id").select("slots.*,locations.lat,locations.lng,locations.name")

      end

    else
      
       originLoc["lat"]=origin[0]
       originLoc["lng"]=origin[1]
       destinationLoc["lat"]=destination[0]
       destinationLoc["lng"]=destination[1]
       result["origin"]=originLoc
       result["slots"]=Route::getSlotsForNonExistentRoute
       result["destination"]=destinationLoc
       result["route_id"]=-1
       result["route_type"]=Route::ROUTE_DOES_NOT_EXISTS
       result["points"]= Polylines::Encoder.encode_points([origin,destination])

    end



     render :json=>result.to_json

  end


  def insertLiveRoutes

    routes=RouteExist.where("route_points is null")
    routes.each do |route|
       points=Slot.where(:routeid=>route.id).order("timeinmins asc").joins("join locations on slots.locationid=locations.id").select("slots.*,locations.lat,locations.lng")

       if (points!=nil && points.size>0)
         pointsFinal=Array.new
         points.each do |point|
           p=Hash.new
           p["lat"]=point["lat"]
           p["lng"]=point["lng"]
           pointsFinal.push p
         end
        dir=GoogleDirection.new(pointsFinal)
        dir.execute
        if dir.overviewPolyline!=nil
          route.route_points=dir.overviewPolyline
          route.save
        end
       end

    end


  end


  def insertSuggestedRoute



  end


  def refreshRouteCache
    Route::initializeRouteCache
    render :text=>"refreshed"

  end



  def saveNewSuggestion


    customer_number=params[:phone_number]
    data=JSON.parse params[:data1]
    customer_number=data["phone_number"]
    from_lat=data["homelat"]
    to_lat=data["officelat"]
    from_lng=data["homelng"]
    to_lng=data["officelng"]
    from_str=data["homeAddress"]
    to_str=data["officeAddress"]
    pushSubStatus=data["pushSubscriptionStatus"]

    subId=data["subscriberID"]
    from_mode=""
    to_mode=""
    from_time=""
    to_time=""
    from_mode=data["commutework"].join(",") if data["commutework"]!=nil
    to_mode=data["commutework"].join(",") if data["commutework"]!=nil
    from_time=data["reachwork"].join(",") if data["reachwork"]!=nil
    to_time=data["leavework"].join(",")  if data["leavework"]!=nil
    routeid=0
    if data["route_type"]==Route::ROUTE_DOES_NOT_EXISTS
     route_type=1
     routeid=0
    else
      route_type=data["route_type"]==Route::LIVE_ROUTE ? 2:3
      routeid=data["routeid"].to_i
    end

    if customer_number!=nil && from_lat!=nil && to_lat!=nil && from_lng!=nil  && to_lng!=nil && from_mode!=nil && to_mode!=nil && from_time!=nil && to_time!=nil && from_str!=nil && to_str!=nil

      suggestion=CustomerSuggestion.new
      suggestion.customer_number=customer_number
      suggestion.from_lat=from_lat
      suggestion.from_lng=from_lng
      suggestion.to_lat=to_lat
      suggestion.to_lng=to_lng
      suggestion.from_str=from_str
      suggestion.from_mode=from_mode
      suggestion.from_time=from_time
      suggestion.to_lat=to_lat
      suggestion.sub_status=pushSubStatus
      suggestion.sub_id=subId
      suggestion.to_lng=to_lng
      suggestion.to_time=to_time
      suggestion.to_str=to_str
      suggestion.to_mode=to_mode
      suggestion.route_type=route_type
      suggestion.routeid=routeid
      suggestion.save
      if routeid>0 && false
      from_time.split(",").each do |timeslot|

        summ=RouteSuggestionAndLiveSummary.where(:routid=>routeid).where(:timeslot=>timeslot.to_i).where(:route_type=>route_type)
        if (summ.size==0)
          summ=RouteSuggestionAndLiveSummary.new
          summ.routeid=routeid
          summ.route_type=route_type
          summ.people_interested=1
          summ.timeslot=timeslot
          summ.save

        else
          summ.first.people_interested=summ[0].people_interested+1
          summ.first.save
        end
      end
      end

      render :text=>"OK"
    else
      render :text=>"Error"
    end

  end


  def generateShareLink




  end


  def makePhoneCall

    if (params[:phone_number]==nil)
      render :text=>"Exception"
      return
    end
    ivr=IvrCallLog.new
    ivr.phone_number=params[:phone_number]
    ivr.save
    TelephonyManager.sendIvrCall(params[:phone_number])
    result=Hash.new
    result["success"]="true"
    render :json=>result.to_json

  end


  def verifyPhoneCall

    phoneNumber=params[:phone_number]
    result =Hash.new
    if phoneNumber==nil
      result["success"]=false
      render :json=>result.to_json
      return
    end
    callLog=IvrCallLog.where(:phone_number=>phoneNumber).last

    if callLog!=nil
      if callLog.success==1
        result["is_done"]=1
      else
        result["is_done"]=0
      end
      result["success"]=true
    else
      result["success"]=false

    end

    render :json=>result.to_json

  end





  def confirmUser
    keypress=params[:keypress]
    phoneNumber=params[:caller]
    if (keypress==nil || phoneNumber==nil)
      render :text=>"error"
      return
    end

    if keypress.to_i==1
      callLog=IvrCallLog.where(:phone_number => phoneNumber).last
      if callLog!=nil
        callLog.success=1
        callLog.save

      end
    end
    render :text=>"OK"
  end





  def getLink

    from=params[:from]
    to=params[:to]
    result=Polylines::Encoder.encode_points([[from.split(",")[0].to_f,from.split(",")[1].to_f],[to.split(",")[0].to_f,to.split(",")[1].to_f]])

    render :text=>"http://myor.shuttl.com/suggest/index?paths="+result


  end


  def getWhatsAppShareLink
    url=params[:url]
    phoneNumber=params[:phone_number]
    source=Crypto::KeyGenerator.simpleEncryption phoneNumber
    result=Hash.new
    result["whatsapp_url"]=BitlyUtils.shortenUrl url+"&utm_source=whatsapp&sou="+source
    render :json=>result.to_json

  end


  def redirectToPlayStore

    if (/iPhone/=~request.user_agent)
      redirect_to "https://itunes.apple.com/in/app/shuttl-cool-smart-bus/id1043422614?mt=8"
    else
      redirect_to "http://play.google.com/store/apps/details?id=app.goplus.in.myapplication"
    end



  end



  def getmapview

  end

  skip_before_filter :verify_authenticity_token
  before_filter :cors_preflight_check
  after_filter :cors_set_access_control_headers

# For all responses in this controller, return the CORS access control headers.
  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Max-Age'] = "1728000"
  end

# If this is a preflight OPTIONS request, then short-circuit the
# request, return only the necessary headers and return an empty
# text/plain.

  def cors_preflight_check
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version'
    headers['Access-Control-Max-Age'] = '1728000'
  end

  def base
    if (/bus2work/=~request.host)
      redirect_to :controller=>:suggest,:action=>:index_orca
    else
      redirect_to :controller=>:suggest,:action=>:index
    end
  end

  def getInfo
    render :json=>session["info"].to_json
  end


  def sendOtp

    phoneNumber=params[:phoneNumber]
    otp=rand(1000..9999)
    OtpMessage.create(:otp=>otp,:phone_number=>phoneNumber)
    TelephonyManager.sendSms phoneNumber,"Ahoy! Welcome to Shuttl.Please enter #{otp} to verify your number.The ride begins!"
    response=Hash.new
    response["success"]=true
    render :json=>response.to_json
  end

  def verifyOtp
    phoneNumber=params[:phoneNumber]
    otp_number=params[:otp]
    otp=OtpMessage.where(:phone_number => phoneNumber).last
    response=Hash.new
    if (otp!=nil && otp.otp.to_s==otp_number)
      response["success"]=true
    else
      response["success"]=false
    end
    render :json=>response.to_json
  end





  def createRoute

    timestamp=params[:timeStamp]
    name=params[:name]
    pick=params[:pickUpPoint]
    pricing=params[:pricing]
    if timestamp==nil || name==nil || pick==nil || pricing==nil
      render :text=>"Error"
    else
      timestamp=timestamp.split "~"
      pick=pick.split "~"
      pricing=pricing.split "~"
      timestampA=Array.new
      pickA=Array.new
      pricingA=Array.new
      timestamp.each do |tim|

        if tim.split(";").length==3
          timestampA.push tim.split(";")
        else
          raise CustomError::ParamsException,"Invalid Timestamps"
        end

      end

      pick.each do |pic|

        if pic.split(";").length==4
          pickA.push pic.split(";")
        else
          raise CustomError::ParamsException,"Invalid pick up points"
        end

      end

      pricing.each do |pri|
        if pri.split(";").length==4
          pricingA.push pri.split(";")
        else
          raise CustomError::ParamsException,"Invalid pricing"
        end

      end



      success,route=Route.createRoute name,pickA,timestampA,pricingA,Route::SUGGESTED_ROUTE

      response=Hash.new

      if success
        response["success"]=true
        response["routeid"]=route.id
        render :json=>response.to_json
      else
        response["success"]=false
        render :text=>response.to_json
      end
    end
  end


  def getSlotsWithCoords
    origin_lat=params[:origin_lat]
    origin_lng=params[:origin_lng]
    destination_lat=params[:destination_lat]
    destination_lng=params[:destination_lng]
    route=Hash.new

    if origin_lat!=nil && origin_lng!=nil && destination_lat!=nil && destination_lng!=nil

      origin=Array.new
      origin.push origin_lat.to_f
      origin.push origin_lng.to_f
      destination=Array.new
      destination.push destination_lat.to_f
      destination.push destination_lng.to_f
      route=Route::getRouteBetween(origin,destination)

    end

    render :json=>route.to_json

  end


  def getPath
    origin_lat=params[:origin_lat]
    origin_lng=params[:origin_lng]
    destination_lat=params[:destination_lat]
    destination_lng=params[:destination_lng]
    path=""
    if (origin_lat!=nil && origin_lng!=nil && destination_lat!=nil && destination_lng!=nil)
     path=Polylines::Encoder.encode_points([[origin_lat.to_f,origin_lng.to_f],[destination_lat.to_f,destination_lng.to_f]])
    end
    render :text=>path
  end

  def zoneCovered

    i=0
    i=i+1

  end

  def generateWhatsAppShareLinkForUser
    url=params[:url]
    phoneNumber=params[:phone_number]
    source=Crypto::KeyGenerator.simpleEncryption phoneNumber
    result=Hash.new
    sign="?"
    if  url.include? "?"
      sign="&"
    end
    result["whatsapp_url"]=BitlyUtils.shortenUrl url+sign+"utm_source=link_share&sou="+source
    render :text=>result["whatsapp_url"]
  end

  def sendSms
    message=""
  end


end
