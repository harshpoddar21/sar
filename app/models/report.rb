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



  def self.sendSubscriptionSoldInLastXDays routeIds,days


    subsSoldRouteIdWise=Hash.new
    routeIds.each do |routeId|

      results=UmsSubscription.findSubscriptionSoldFirstTime routeId

      lastAllowableDate=Utils.getTodayMorningUnixTime-86400*(days-1)

      subsSoldRouteIdWise[routeId]=Array.new

      (1..days).each do

        subsSoldRouteIdWise[routeId].push 0

      end

      results.each do |result|


        if subsSoldRouteIdWise[routeId]==nil

          subsSoldRouteIdWise[routeId]=Array.new

        end



        if result["bought_date"].to_time.to_i<lastAllowableDate
          break
        end

        dateIndex=(Utils.getTodayMorningUnixTime-result["bought_date"].to_time.to_i)/(Constants::SECONDS_IN_DAY)


        puts dateIndex
        subsSoldRouteIdWise[routeId][dateIndex]=result["subs_sold"]
      end

    end


    subsSoldRouteIdWise


  end


  def self.getTotalAndUniqueSubscriptionSold routeId

    result=Hash.new

    result["total"]=UmsSubscription.findTotalSubscriptionSold routeId
    result["unique"]=UmsSubscription.findUniqueSubscriptionSold routeId
    result["routeId"]=routeId

    result

  end

end