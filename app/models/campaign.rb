class Campaign

  def campaignPlanner

    leadsBifurcation=getLeadsBifurcation

    leadsBifurcation.each do |bif|

      if !bif.appInstalled

        if Session.getCurrentSessionType==Session::MORNING_SESSION

          if bif.morningTime - Time.now.to_i < 30 *Constants::SECONDS_IN_HOUR

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
          if bif.eveningTime - Time.now.to_i < 60 *Constants::SECONDS_IN_HOUR && bif.eveningTime - Time.now.to_i > 0

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

          if bif.morningTime - Time.now.to_i < 30 *Constants::SECONDS_IN_HOUR && bif.morningTime - Time.now.to_i > 0

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
          if bif.eveningTime - Time.now.to_i < 60 *Constants::SECONDS_IN_HOUR && bif.eveningTime - Time.now.to_i > 0

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


  class CampaignUser

    APP_INSTALL=1
    FIRST_BOOKING=2
    attr_accessor :phoneNumber,
                  :morningTime,:eveningTime,
                  :userId,:didFirstBooking,:appInstalled,:fromLocation,:toLocation

  end
end