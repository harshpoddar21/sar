class Campaign


  def sendSubscriptionCampaignToAcquiredUser targetingStart,targetingEnd,routeId

    if targetingStart==nil
      targetingStart=(Time.now.to_i/86400)*86400-500*86400
    end
    if targetingEnd==nil

      targetingEnd=(Time.now.to_i/86400)*86400+86400

    end
    if !routeId.is_a?(Array)
      routeId=Array.new
    end
    nonConvertedUsers=Campaign.getNonConvertedUsers targetingStart,targetingEnd,routeId

    puts nonConvertedUsers
    unsubscribedUsers=UmsSubscription.findUnsubscribedUsers nonConvertedUsers
    puts unsubscribedUsers
    unsubscribedUsers=Transaction.findUnsubscribedUsers unsubscribedUsers
    puts unsubscribedUsers

    Campaign.sendFollowUpCommunication unsubscribedUsers
  end
  def campaignPlanner

    return
    leadsBifurcation=getLeadsBifurcation

    leadsBifurcation.each do |bif|

      if !bif.appInstalled

        if Session.getCurrentSessionType==Session::MORNING_SESSION

          if bif.morningTime - Time.now.to_i < 30 *Constants::SECONDS_IN_MINS

            if CampaignManager.where(:phone_number => bif.phoneNumber)
                   .where(:campaign_type => CampaignUser::APP_INSTALL)
                   .where("unix_timestamp(created_at)>"+Utils.getTodayMorningUnixTime().to_s).size==0

            sendAppDownloadLinkToCamUser bif
            CampaignManager.create(:phone_number=>bif.phoneNumber,
                                   :campaign_type=>CampaignUser::APP_INSTALL,:time_sent => Time.now.to_i)
            end
          else
          end
        else
          if bif.eveningTime - Time.now.to_i < 60 *Constants::SECONDS_IN_MINS && bif.eveningTime - Time.now.to_i > 0

            if CampaignManager.where(:phone_number => bif.phoneNumber)
                   .where(:campaign_type => CampaignUser::APP_INSTALL)
                   .where("unix_timestamp(created_at)>"+Session.getMorningSessionEndUnixTime().to_s).size==0

              sendAppDownloadLinkToCamUser bif
              CampaignManager.create(:phone_number=>bif.phoneNumber,
                                     :campaign_type=>CampaignUser::APP_INSTALL,:time_sent => Time.now.to_i)
            end

          end

        end

      elsif !bif.didFirstBooking

        if Session.getCurrentSessionType==Session::MORNING_SESSION

          if bif.morningTime - Time.now.to_i < 30 *Constants::SECONDS_IN_MINS && bif.morningTime - Time.now.to_i > 0

            if CampaignManager.where(:phone_number => bif.phoneNumber)
                   .where(:campaign_type => CampaignUser::FIRST_BOOKING)
                   .where("unix_timestamp(created_at)>"+Utils.getTodayMorningUnixTime().to_s).size==0

              sendFirstBookingMessageToCamUser bif
              CampaignManager.create(:phone_number=>bif.phoneNumber,
                                     :campaign_type=>CampaignUser::FIRST_BOOKING,:time_sent => Time.now.to_i)
            end
          else
          end
        else
          if bif.eveningTime - Time.now.to_i < 60 *Constants::SECONDS_IN_MINS && bif.eveningTime - Time.now.to_i > 0

            if CampaignManager.where(:phone_number => bif.phoneNumber)
                   .where(:campaign_type => CampaignUser::FIRST_BOOKING)
                   .where("unix_timestamp(created_at)>"+Session.getMorningSessionEndUnixTime().to_s).size==0

              sendFirstBookingMessageToCamUser bif

              CampaignManager.create(:phone_number=>bif.phoneNumber,
                                     :campaign_type=>CampaignUser::FIRST_BOOKING,:time_sent => Time.now.to_i)
            end

          end

        end
      else

      end
    end


  end

  def sendAppDownloadLinkToCamUser camUser

    TelephonyManager.sendSms camUser.phoneNumber,"Hello Shuttlr! Download the Shuttl app to help us in making your office commute better. Also do use the coupon code NXR50 to get 50% discount on your first ride. http://bit.ly/downloadShuttl"
  end

  def sendFirstBookingMessageToCamUser camUser

    TelephonyManager.sendSms camUser.phoneNumber,"Hello Shuttlr! Please use coupon code NXR50 to get 50% discount on your first ride with Shuttl."
  end

  def getLeadsBifurcation
    allPeople=Array.new

    allSugUsersPhoneNumberHash=Hash.new
    GetSuggestionViaTab.all.each do |sug|
      camUser=CampaignUser.new
      camUser.appInstalled=false
      camUser.didFirstBooking=false
      camUser.phoneNumber=sug.customer_number
      morningTime=sug.from_time.split(",")[0]
      morningTime=morningTime.split(":")

      camUser.morningTime=Utils.getTodayMorningUnixTime+morningTime[0].to_i*Constants::SECONDS_IN_HOUR+morningTime[1].to_i*Constants::SECONDS_IN_MINS
      eveningTime=sug.to_time.split(",")[0]
      eveningTime=eveningTime.split(":")
      camUser.eveningTime=Utils.getTodayMorningUnixTime+eveningTime[0].to_i*Constants::SECONDS_IN_HOUR+eveningTime[1].to_i*Constants::SECONDS_IN_MINS
      camUser.fromLocation=sug.from_str
      camUser.toLocation=sug.to_str
      allPeople.push camUser.phoneNumber
      allSugUsersPhoneNumberHash[sug.customer_number]=camUser
    end

    users=UmsUser.where("PHONE_NUMBER in ("+allPeople.join(",")+")")

    userIds=Array.new
    allSugUsersUserIdHash=Hash.new
    users.each do |user|
      userIds.push user["USER_ID"]
      camUser=allSugUsersPhoneNumberHash[user["PHONE_NUMBER"].to_s]
      camUser.appInstalled=true
      allSugUsersUserIdHash[user["USER_ID"].to_s]=camUser
    end

    didFirstBooking=Array.new

    bookings=UmsBooking.where("USER_ID in ("+userIds.join(",")+")")

    bookings.each do |booking|
      if ! (didFirstBooking.include? booking["USER_ID"].to_s)
        camUser=allSugUsersUserIdHash[booking["USER_ID"].to_s]
        camUser.didFirstBooking=true

      end
    end
    allLeads=Array.new
    allSugUsersPhoneNumberHash.each do |key,camUser|
      allLeads.push camUser
    end
    allLeads
  end




  def self.getNonConvertedUsers targetingStart,targetingEnd,routeIdRestricted

    suggestions=Array.new
    if targetingStart.is_a?(Fixnum) && targetingEnd.is_a?(Fixnum)
      if routeIdRestricted.is_a?(Array) && routeIdRestricted.size>0

        suggestions=GetSuggestionViaTab.where("unix_timestamp(created_at)>#{targetingStart}")
                        .where("unix_timestamp(created_at)<#{targetingEnd}").where("routeid in ("+routeIdRestricted.join(",")+")").where("unsubscribed=0 or unsubscribed is null")
      else
        suggestions=GetSuggestionViaTab.where("unix_timestamp(created_at)>#{targetingStart}")
                        .where("unix_timestamp(created_at)<#{targetingEnd}").where("unsubscribed=0 or unsubscribed is null")
      end
    end

    phoneNumbers=Array.new

    suggestions.each do |sugg|
      phoneNumbers.push sugg["customer_number"]
    end
    phoneNumbers
  end


  def self.sendFollowUpCommunication phoneNumbers

    phoneNumbers.each do |number|

      link="https://myor.shuttl.com/campaign/unsubscribeUser?phoneNumber=#{number}"
      shortenedLink=BitlyUtils.shortenUrl link

      puts shortenedLink
      TelephonyManager.sendSms(number,"Hello Shuttlr!! We just found out that you have not subscribed to Shuttl. If you need any help or to unsubscribe please click on #{shortenedLink}")

    end

  end

  def self.unsubscribeFromCampaign phone_number

    GetSuggestionViaTab.where("customer_number=#{phone_number}").each do |sugg|
      sugg.unsubscribed=1
      sugg.save
    end

  end

  class CampaignUser

    APP_INSTALL=1
    FIRST_BOOKING=2
    attr_accessor :phoneNumber,
                  :morningTime,:eveningTime,
                  :userId,:didFirstBooking,:appInstalled,:fromLocation,:toLocation

  end
end