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
       result["origin"]=originLoc
       result["route_id"]=route.id
       result["destination"]=destinationLoc
       result["route_type"]=route.routeType
       result["points"]=route.routePoints

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

    customer_number=params[:number]
    from_lat=params[:from_lat]
    to_lat=params[:to_lat]
    from_lng=params[:from_lng]
    to_lng=params[:to_lng]
    from_str=params[:from_str]
    to_str=params[:to_str]
    from_mode=params[:from_mode]
    to_mode=params[:to_mode]
    from_time=params[:from_time]
    to_time=params[:to_time]
    route_type=params[:route_type]
    routeid=params[:routeid]
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
      suggestion.to_lng=to_lng
      suggestion.to_time=to_time
      suggestion.to_str=to_str
      suggestion.to_mode=to_mode
      suggestion.route_type=route_type
      suggestion.routeid=routeid
      suggestion.save
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









end
