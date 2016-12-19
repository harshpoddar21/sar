class Report

  def self.getBookingNumbersForToday routeIds

    bookings=nil

    if routeIds.is_a? Array

      bookings=UmsBooking.getBookingCountForRouteId (Time.now.to_i/Constants::SECONDS_IN_DAY)*Constants::SECONDS_IN_DAY,(Time.now.to_i/Constants::SECONDS_IN_DAY)*Constants::SECONDS_IN_DAY+Constants::SECONDS_IN_DAY,routeIds


    else
      raise CustomError::ParamsException,"Invalid Parameters"
    end

    bookings
  end



  def self.sendSubscriptionSoldToday routeIds


    routeIds.each do |routeId|

      results=UmsSubscription.findSubscriptionSoldFirstTime routeId

      results.each do |result|

        result["bought_date"]

      end

    end





  end

end