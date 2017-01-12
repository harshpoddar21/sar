class LLead < ActiveRecord::Base



  def self.constructLeadFromAnswer phoneNumber,answer,isInterested,prefilledAnswer,channelCategory,channelId,from,to,modeOfCommute,campaignId


    lead=LLead.new
    lead.phone_number=phoneNumber
    lead.is_interested=isInterested
    lead.prefilled_answer=prefilledAnswer
    lead.channel_category_id=channelCategory
    lead.channel_id=channelId
    lead.answer=answer
    lead.from=from
    lead.to=to
    lead.mode_of_comute=modeOfCommute
    lead.campaign_id=campaignId
    lead

  end


  def self.getAnswerToQuestionNo answer,questionNo

    return ((Utils.hexToDecimal(answer) % (16<<(questionNo-1)) - Utils.hexToDecimal(answer) % (16<<questionNo-2))) / (16<<(questionNo-2));

  end

  def self.isValidLead? phoneNumber


    self.find_by_phone_number(phoneNumber)==nil

  end


  def self.saveNewLead phoneNumber,isInterested,channelCategory,channelId,from,to,modeOfCommute,campaignId,routeId




    if self.isValidLead? phoneNumber

      lead=LLead.new
      lead.phone_number=phoneNumber
      lead.is_interested=isInterested
      lead.channel_category_id=channelCategory
      lead.channel_id=channelId
      lead.campaign_id=campaignId
      lead.mode_of_comute=modeOfCommute
      lead.from=from
      lead.route_id=routeId
      lead.to=to
      lead.save
    else

    end



  end

  def self.updateRideCount


    leadPhoneNumbers=Array.new
    leadGenerated=Hash.new
    LLead.all.each do |ll|


      leadGenerated[ll.phone_number.to_s]=ll
      leadPhoneNumbers.push ll.phone_number.to_s

    end

    routesServed=LLeadRoute.getAllRouteIds


    result=UmsBooking.where("ROUTE_ID in (#{routesServed.join(",")})")
               .where("PHONE_NUMBER in (#{leadPhoneNumbers.join(",")})")
               .joins("join USERS on BOOKINGS.USER_ID=USERS.USER_ID")
                .where("BOARDING_TIME>#{(1483563778-86400*5)*1000}").select("PHONE_NUMBER,BOARDING_TIME")

    resultFinal=Hash.new

    result.each do |res|
      phoneNumber=res["PHONE_NUMBER"].to_s
      boardingTime=(res["BOARDING_TIME"]/1000)
      if !leadGenerated[phoneNumber.to_s]
        puts "not found"
        next
      end
      if boardingTime>((leadGenerated[phoneNumber.to_s]).created_at.to_i-600)
        if resultFinal[phoneNumber]==nil
          resultFinal[phoneNumber]=1
        else
          resultFinal[phoneNumber]=resultFinal[phoneNumber]+1
        end
      end
    end

    resultFinal.each do |phoneNumber,totalRidesAfterLead|

      if leadGenerated[phoneNumber].no_of_rides==nil || totalRidesAfterLead>leadGenerated[phoneNumber].no_of_rides
        self.updateRideCountForLead phoneNumber,totalRidesAfterLead
      end
    end
  end


  def self.updateRideCountForLead phoneNumber,rides

    lead=LLead.find_by_phone_number phoneNumber
    if lead.no_of_rides==nil || lead.no_of_rides<rides
      lead.no_of_rides=rides
      lead.save

    end

  end

  def self.updateSubscriptionStatus



    leadPhoneNumbers=Array.new

    leadGenerated=Hash.new

    LLead.all.each do |ll|
      leadGenerated[ll.phone_number.to_s]=ll
      leadPhoneNumbers.push ll.phone_number
    end

    result=UmsSubscription.where("PHONE_NUMBER in (#{leadPhoneNumbers.join(",")})")
        .joins(" join USERS on USERS.USER_ID=USER_SUBSCRIPTIONS.USER_ID").select("PHONE_NUMBER,USER_SUBSCRIPTIONS.CREATED_TIME")

    result.each do |res|

      if !leadGenerated[res["PHONE_NUMBER"].to_s]

        puts "Not Found"
        next
      end

      if (res["CREATED_TIME"]/1000)>(leadGenerated[res["PHONE_NUMBER"].to_s].created_at.to_i-86400)

        self.changeSubscriptionBoughtStatus res["PHONE_NUMBER"].to_s,1
      end

    end

  end

  def self.changeSubscriptionBoughtStatus phoneNumber,status
    llead=self.find_by_phone_number phoneNumber
    if llead.subscription_bought==0
      llead.subscription_bought=1
      llead.save
    end

  end

  def self.findAllLeadsStartingFromAndTo from,to

    allLeads=Array.new

    leads=LLead.where("unix_timestamp(created_at)>=#{from}").where("unix_timestamp(created_at)<=#{to}")

    leads.each do |lead|
      allLeads.push(JSON.parse lead.to_json)
    end
    allLeads
  end





end
