class UmsSubscription < ActiveRecord::Base
  establish_connection "ums_read_only_replica".to_sym

  self.table_name = "USER_SUBSCRIPTIONS"

  @@subscribedPeople=Hash.new

  def self.isSubscribed? userId,cached=true

    if cached

      @@subscribedPeople[userId]!=nil

    else
      UmsSubscription.where(:USER_ID=>self.user_id).size>0
    end

  end


  def self.findSubscriptionSoldFirstTime routeId


    packages=UmsSubscriptionPackage.findSubscriptionPackagesForRouteId routeId

    packageIds=Array.new
    packages.each do |pa|
      packageIds.push pa.SUBSCRIPTION_PACKAGE_ID
    end
    results=UmsSubscription.joins(" left join USER_SUBSCRIPTIONS as b on USER_SUBSCRIPTIONS.USER_ID=b.USER_ID
      and USER_SUBSCRIPTIONS.USER_SUBSCRIPTION_ID>b.USER_SUBSCRIPTION_ID")
        .where(" USER_SUBSCRIPTIONS.SUBSCRIPTION_PACKAGE_ID in (#{packageIds.join(",")})
         and b.SUBSCRIPTION_PACKAGE_ID is null")
        .group("bought_date").order("bought_date desc")
        .select("date(from_unixtime(USER_SUBSCRIPTIONS.CREATED_TIME/1000)) as bought_date,
         count(distinct(USER_SUBSCRIPTIONS.USER_ID))")


    results

  end


  def self.refreshSubscribers
    @@subscribedPeople=Hash.new
    UmsSubscription.all.each do |subs|
      @@subscribedPeople[subs[:USER_ID]]=true
    end
  end




  def self.findUnsubscribedUsers allUsers

    if allUsers!=nil && allUsers.is_a?(Array)
      if allUsers.size>0
        subscribers=Array.new
        UmsSubscription.joins(" join USERS on USERS.USER_ID=USER_SUBSCRIPTIONS.USER_ID ").where("USERS.PHONE_NUMBER in ("+allUsers.join(",")+")").each do |sub|
          subscribers.push sub["PHONE_NUMBER"]
        end

      else
        return Array.new

      end

    else
      raise Exception,"Invalid Arguments"
    end


    allUsers-subscribers
  end



end