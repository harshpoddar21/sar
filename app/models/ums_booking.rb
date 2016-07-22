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

    ConnectionManager.makePostHttpRequest Url::FIND_SLOTS,reqParams,{'Content-Type' =>'application/json'},true

  end


  class Url

    FIND_SLOTS="http://goplus.in/v3/routes/slots/rebookSlots"

  end
end