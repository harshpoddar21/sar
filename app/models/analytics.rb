class Analytics


  LAST_BOOKING_KEY="last_booking"
  LAST_SUBSCRIPTION_KEY="last_subscription"
  def self.trackBooking fromLocationId,routeId,price,bookingId,userId,couponCode


    if fromLocationId==nil || routeId==nil || price==nil || bookingId==nil || userId==nil
      raise CustomError::ParamsException,"Invalid params"
    end
    name=PickUpPointClusterMapping.find_by_from_id fromLocationId
    if name!=nil
      name=name.name
    else
      name=fromLocationId.to_s
    end
    routeId=routeId
    user=UmsUser.where("USER_ID=#{userId}").first
    phoneNumber=""
    if user!=nil
      phoneNumber=user["PHONE_NUMBER"]
    end

    GoogleAnalytics.sendBookingTransaction name,routeId,price,"b"+bookingId.to_s,phoneNumber,couponCode

  end

  def self.sendSubscriptionBought userId,routeId,fromLocationId,price,subscriptionId

    puts userId
    puts routeId
    puts fromLocationId
    puts price
    puts subscriptionId

    name=PickUpPointClusterMapping.find_by_from_id fromLocationId
  if name!=nil
    name=name.name
  else
    name=fromLocationId.to_s
  end
  routeId=routeId
  user=UmsUser.where("USER_ID=#{userId}").first
  phoneNumber=""
  if user!=nil
    phoneNumber=user["PHONE_NUMBER"]
  end


    GoogleAnalytics.sendSubscriptionTransaction routeId,price,"s"+subscriptionId.to_s,phoneNumber,name


  end

  def self.updateBookingData

    routes=Array.new
    LLeadRoute.all.each do |leadRoute|
      routes.push leadRoute.route_id
    end
    lastBoardingTime=Analytic.find_by_key LAST_BOOKING_KEY
    if lastBoardingTime==nil
      lastBoardingTime=0
    else
      lastBoardingTime=lastBoardingTime.value.to_i
    end

    lastB=lastBoardingTime
    UmsBooking.where("BOARDING_TIME>#{lastBoardingTime}")
        .where("ROUTE_ID in  (#{routes.join(",")}) ")
        .where("STATUS in ('CONFIRMED','POSTPONED')")
        .where("BOARDING_TIME<(#{Time.now.to_i-300}*1000)")
        .where("BOARDING_TIME>(#{Utils.getTodayMorningUnixTime}*1000)").order("BOARDING_TIME asc").each do |booking|
           self.trackBooking booking["FROM_LOCATION_ID"],booking["ROUTE_ID"],booking["DISCOUNTED_FARE"],booking["BOOKING_ID"],booking["USER_ID"],booking["COUPON_CODE"]
           lastB=booking["BOARDING_TIME"]

    end
    lastBooking=Analytic.find_by_key LAST_BOOKING_KEY
    if lastBooking==nil
      Analytic.create(:key=>LAST_BOOKING_KEY,:value=>lastB)
    else
      lastBooking.value=lastB
      lastBooking.save

    end
  end


  def self.updateSubscriptionData

    routes=Array.new
    LLeadRoute.all.each do |leadRoute|
      routes.push leadRoute.route_id
    end
    lastSubscriptionId=Analytic.find_by_key LAST_SUBSCRIPTION_KEY
    if lastSubscriptionId==nil
      lastSubscriptionId=0
    else
      lastSubscriptionId=lastSubscriptionId.value.to_i
    end
    lastS=lastSubscriptionId

    UmsSubscription
        .where("ROUTE_ID in  (#{routes.join(",")}) or RETURN_ROUTE_ID in  (#{routes.join(",")})")
        .where("USER_SUBSCRIPTIONS.ACTIVE =1")
         .joins("join SUBSCRIPTION_PACKAGES on SUBSCRIPTION_PACKAGES.SUBSCRIPTION_PACKAGE_ID=USER_SUBSCRIPTIONS.SUBSCRIPTION_PACKAGE_ID")
    .select("USER_SUBSCRIPTIONS.*,SUBSCRIPTION_PACKAGES.*")
        .where("EXPIRED=false")
        .where("USER_SUBSCRIPTION_ID>#{lastSubscriptionId}")
        .each do |subscription|

      routeId=subscription["ROUTE_ID"]>subscription["RETURN_ROUTE_ID"] ? subscription["RETURN_ROUTE_ID"] : subscription["ROUTE_ID"]
      fromLocationId=subscription["ROUTE_ID"]>subscription["RETURN_ROUTE_ID"] ? subscription["SUBSCRIPTION_TO_ID"] : subscription["SUBSCRIPTION_FROM_ID"]
      self.sendSubscriptionBought subscription["USER_ID"],routeId,fromLocationId,subscription["PRICE"],subscription["USER_SUBSCRIPTION_ID"]
      lastS=subscription["USER_SUBSCRIPTION_ID"]

    end

    lastSubscription=Analytic.find_by_key LAST_SUBSCRIPTION_KEY
    if lastSubscription==nil
      Analytic.create(:key=>LAST_SUBSCRIPTION_KEY,:value=>lastS)
    else
      lastSubscription.value=lastS
      lastSubscription.save
    end
  end

end