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

      lastAllowableDate=Utils.getTodayMorningUnixTime+5*Constants::SECONDS_IN_HOUR+30*Constants::SECONDS_IN_MINS-86400*(days-1)

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

        dateIndex=(Utils.getTodayMorningUnixTime+5*Constants::SECONDS_IN_HOUR+30*Constants::SECONDS_IN_MINS-result["bought_date"].to_time.to_i)/(Constants::SECONDS_IN_DAY)


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


  def self.getNewUserCountInLastXDays routeIds,days

    newUserCount=UmsBooking.getNewUserBookingCountForRouteId routeIds

    result=Array.new
    (1..days).each do

      result.push 0
    end

    lastDateAllowed=Utils.getTodayMorningUnixTime+5*Constants::SECONDS_IN_HOUR+30*Constants::SECONDS_IN_MINS-(days-1)*Constants::SECONDS_IN_DAY
    newUserCount.each do |userC|

      if userC["first_boarding_date"].to_time.to_i<lastDateAllowed
        break
      end
      index=(Utils.getTodayMorningUnixTime+5*Constants::SECONDS_IN_HOUR+30*Constants::SECONDS_IN_MINS-userC["first_boarding_date"].to_time.to_i)/Constants::SECONDS_IN_DAY
      puts index.to_s+"s"
      result[index]=userC["new_user_count"]

    end


    result


  end


  def self.getBoardingNumberRouteIdWise routeId,from,to

    GetSuggestionViaTab.where("make_booking=1").
        where("unix_timestamp(created_at)<#{to}").where("unix_timestamp(created_at)>=#{from}")
        .where("routeid=#{routeId}").size
  end

end