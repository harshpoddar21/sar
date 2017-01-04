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

    LLead.all.each do |ll|

      leadPhoneNumbers.push ll.phone_number
    end

    routesServed=LLeadRoute.getAllRouteIds


    result=UmsBooking.where("ROUTE_ID in (#{routesServed.join(",")})")
               .where("PHONE_NUMBER in (#{leadPhoneNumbers.join(",")})").group("PHONE_NUMBER")
               .select("PHONE_NUMBER,count(*) as BOOKING_COUNT").joins("join USERS on BOOKINGS.USER_ID=USERS.USER_ID")

    result.each do |res|

      llead=LLead.find_by_phone_number res["PHONE_NUMBER"]
      llead.no_of_rides=res["BOOKING_COUNT"]
      llead.save

    end
  end


  def self.updateSubscriptionStatus



    leadPhoneNumbers=Array.new

    LLead.all.each do |ll|

      leadPhoneNumbers.push ll.phone_number
    end

    result=UmsSubscription.where("PHONE_NUMBER in (#{leadPhoneNumbers.join(",")})")
        .joins(" join USERS on USERS.USER_ID=USER_SUBSCRIPTIONS.USER_ID").select("PHONE_NUMBER")

    result.each do |res|

      llead=self.find_by_phone_number res["PHONE_NUMBER"]
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
