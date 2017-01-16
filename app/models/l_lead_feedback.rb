class LLeadFeedback < ActiveRecord::Base


  class Channel
    VIA_CALL="call"

    VIA_SMS="sms"
  end
  def self.createLeadFeedback phoneNumber,channel,response
    self.create(:phone_number=>phoneNumber,:feedback_channel=>channel,:response=>response)

    return true
  end


  def self.generateLeadFeedback

    startBoardingTime=Time.now.to_i
    if Session.getCurrentSessionType==Session::MORNING_SESSION
      puts "Moring"
      startBoardingTime=Utils.getTodayMorningUnixTime
    else
      startBoardingTime=Utils.getTodayMorningUnixTime+16*3600
    end
    phoneNumbers=Array.new
    BoardingRequest.where("requested_boarding_time>#{startBoardingTime}").where("requested_boarding_time<#{Time.now.to_i}").each do |req|
      phoneNumbers.push req.phone_number
    end
    LLead.where(:channel_category_id => "direct").where("unix_timestamp(created_at)>#{startBoardingTime}")
    .where("unix_timestamp(created_at)<#{Time.now.to_i}").each do |lead|
      phoneNumbers.push lead.phone_number
    end

    phoneNumbers.each do |phoneNumber|
      TelephonyManager.sendFeedbackIvrCall phoneNumber
    end
  end

end
