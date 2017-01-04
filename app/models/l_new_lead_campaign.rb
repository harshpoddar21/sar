class LNewLeadCampaign < ActiveRecord::Base


  @@Campaign={

      btl:{

          channelCategoryId:"btl",
          campaignName:"btl_morning_evening"
      },
      organic:{

          channelCategoryId:"direct",
          campaignId:"none",
          channelId:"organic"
      }
  }

  def self.Campaign
    @@Campaign
  end
  def self.saveNewLeadAndAttemptBoarding phoneNumber,answer,isInterested,prefilledAnswer,channelCategory,channelId,from,to,modeOfCommute,campaignId

    response=Result.new



    if phoneNumber!=nil && answer!=nil && isInterested!=nil && channelCategory!=nil && channelId!=nil && campaignId!=nil && from!=nil && to!=nil


      if LLead.isValidLead? phoneNumber


        lead=LLead.constructLeadFromAnswer phoneNumber,answer,isInterested,prefilledAnswer,channelCategory,channelId,from,to,modeOfCommute,campaignId

        lead.save

        BoardingCampaign.sendBoardingRequestViaSms phoneNumber,from,to,channelCategory,channelId,campaignId

      else
        result.success=false
        result.message="You have already taken a travel ride with us"

      end

    else


      result.success=false
      result.message="Something bad has happened. Please try again after some time."


    end

  end



  def self.getOrganicLeads


    lastBoarding=BoardingRequest.findLastBoardingByChannelId LNewLeadCampaign.Campaign[:organic][:channelId]

    lastBookingId=0

    if lastBoarding!=nil

      lastBookingId=lastBoarding.ums_booking_id

    end



    routeIds=LLeadRoute.getAllRouteIds
    if routeIds!=nil && routeIds.size>0


      #booking count < 2 and have booked in at most last 10 days
      bookingCounts=UmsBooking.where(" USER_ID IN (select distinct(USER_ID) from BOOKINGS where BOOKING_ID>#{lastBookingId} and BOARDING_TIME>#{(Time.now.to_i-10*86400)*1000} and ROUTE_ID in (#{routeIds.join(",")}))")
          .where("ROUTE_ID in (#{routeIds.join(",")})")
          .group("USER_ID").select("USER_ID,count(*) as booking_count,ROUTE_ID").having("booking_count<7")


      potentialLeadsUserIds=Array.new
      potentialLeadsDetails=Hash.new


      bookingCounts.each do |bookingCount|

        potentialLeadsUserIds.push bookingCount["USER_ID"]
        potentialLeadsDetails[bookingCount["USER_ID"]]={"routeId"=>bookingCount["ROUTE_ID"]}

      end

      peopleBoughtSubscriptionEarlier=UmsSubscription.filterUsersBoughtSubscriptionAmongUserIds potentialLeadsUserIds

      potentialLeadsUserIds=potentialLeadsUserIds-peopleBoughtSubscriptionEarlier

      users=UmsUser.where("USER_ID in (#{potentialLeadsUserIds.join(",")})")


      users.each do |user|
        potentialLeadsDetails[user["USER_ID"]]["phoneNumber"]=user["PHONE_NUMBER"]
      end


      potentialLeadsDetails.each do |userId,details|

        if !(potentialLeadsUserIds.include? userId)

          next

        end


          LLead.saveNewLead details["phoneNumber"].to_s,1,LNewLeadCampaign.Campaign[:organic][:channelCategoryId],LNewLeadCampaign.Campaign[:organic][:channelId],nil,nil,nil,LNewLeadCampaign.Campaign[:organic][:campaignId],details["routeId"]


      end

    end



  end






end
