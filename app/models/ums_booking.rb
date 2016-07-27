class UmsBooking < ActiveRecord::Base
  establish_connection "ums_read_only_replica".to_sym

  self.table_name = "BOOKINGS"


  def self.findAvailableBookingSlots fromLocId,toLocId,routeId

    reqParams=Hash.new

    reqParams["fromLocId"]=fromLocId
    reqParams["toLocId"]=toLocId
    reqParams["routeId"]=routeId
    reqParams["userId"]="35363439776879536f4861636b794d79467269656e64"
    #added my user id just to fetch slots

    reqParams={}
    response=ConnectionManager.makeHttpRequest Url::FIND_SLOTS,{'Content-Type' =>'application/json',
                                                       "userId"=>"35363439776879536f4861636b794d79467269656e64"},reqParams

    trip=nil

    if response!=nil
      response=response.body

      if response["success"] && response["data"]!=nil
        slots=response["data"]["slots"]
        if slots!=nil && slots.length>0
          trip=UmsTrip.new
          trip.tripId=slots[0]["trip"]["id"]
          trip.time =slots[0]["trip"]["time"]/1000
          trip.fare=slots[0]["trip"]["fare"]
        end
      end

    end
    return trip
  end


  def self.placeBooking userId,fromId,toId,routeId
    trip=findAvailableBookingSlots fromId,toId,routeId
    bookingId=nil

    if trip!=nil
      bookingId=placeBookingOnTripId trip,userId,fromId,toId,routeId
    else
      Rails.logger.info "Slots not available ums"
    end
    bookingId
  end

  def self.placeBookingOnTripId trip,userId,fromId,toId,routeId

    reqParams=Hash.new
    reqParams["tripId"]=trip.tripId
    reqParams["boardingTime"]=trip.time
    reqParams["fromId"]=fromId
    reqParams["toId"]=toId
    reqParams["routeId"]=routeId
    reqParams["fare"]=trip.fare
    reqParams["partnerId"]=9999999

    response=ConnectionManager.makePostHttpRequest Url::PLACE_BOOKING,reqParams,{'Content-Type' =>'application/json',
                                                                                 "userId"=>"35363439776879536f4861636b794d79467269656e64"},true

    response=JSON.parse response

    logger.info "Booking Json received"
    logger.info response.to_json
    return 1201

  end
  class Url

    UMS_DOMAIN = Rails.env.production? ? "http://goplus.in" : "http://goplus.in"
    FIND_SLOTS=UMS_DOMAIN+"/v3/routes/slots/rebookSlots?fromLocId=3034&toLocId=3014&routeId=831"
    PLACE_BOOKING=UMS_DOMAIN+"/v2/booking/createB2B"
  end
end