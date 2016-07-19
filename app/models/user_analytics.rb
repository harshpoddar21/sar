class UserAnalytics

  attr_accessor :userId

  def fetchNoOfBookingsOnRoute routeId

     UmsBooking.where(:USER_ID=>userId).where(:ROUTE_ID=>routeId).size

  end
end