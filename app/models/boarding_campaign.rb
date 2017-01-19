class BoardingCampaign


  def self.sendBoardingRequestViaSms phoneNumber,from,to,channelCategoryId,channelId,campaignId

    #Only send boarding message to people who have not unsubscribed

    if !(LUnsubscribe.isNumberUnsubscribed?(phoneNumber))


      message=BoardingSmsCampaignMessage.getBoardingMessage phoneNumber,from,to,channelCategoryId,channelId,campaignId
      TelephonyManager.sendSms phoneNumber,message
    else

    end

  end



  def self.generateAppBoardingMessageForCampaign from,to,channelCategory,channelId,campaignId,phoneNumber

    response= "Hi We are very excited to help you in making your office commute hassle free."+
        " Please use the coupon code TRIAL for a free ride. To download app click here."+
        " http://bity.ly/downloadShuttl. "+
        "To stop click #{BitlyUtils.shortenUrl("http://urbanmetro.in/unsubscribe?data="+Utils.generateBase64(from,to,channelCategory,channelId,campaignId,phoneNumber))}"
    response
  end
  def self.sendAppBoardingRequestViaSms phoneNumber,from,to,channelCategoryId,channelId,campaignId

    if !(LUnsubscribe.isNumberUnsubscribed?(phoneNumber))

      message=self.generateAppBoardingMessageForCampaign from,to,channelCategoryId,channelId,campaignId,phoneNumber
      TelephonyManager.sendSms phoneNumber,message

    else



    end


  end


  # boarding campaign to send sms to people with 0 app rides

  def self.boardingSmsCampaignToPeopleWithNoAppRides

    leads=LLead.where("no_of_rides = 0 or no_of_rides is null")

    boardingRequestedNumbers=Array.new
    BoardingRequest.all.each do |boardingReq|
      boardingRequestedNumbers.push boardingReq.phone_number
    end
    leads.each do |lead|


      if !(boardingRequestedNumbers.include? lead.phone_number)

        self.sendBoardingRequestViaSms lead.phone_number,lead.from,lead.to,"sms","boarding_link","automated_rem_mess_board"

      else

        self.sendAppBoardingRequestViaSms lead.phone_number,lead.from,lead.to,"sms","app_boarding_coupon","automated_rem_mess_board"

      end

    end

  end


  def self.sendBoardingAssistanceMessage phoneNumber,from,to

    message="If you have any queries regarding "+
     "pick up point/timings or any other assistance for boarding the Shuttl, please add 9015122792 to your whatsapp. "+
     "You can whatsapp us 24/7 for immediate resolution. We also have ground executives wearing Shuttl branded T-Shirts at pick up point to assist you in boarding Shuttl."
    TelephonyManager.sendSms phoneNumber,message
    TelephonyManager.sendSms phoneNumber,"9015122792"
  end


  def self.createBoardingRequest phoneNumber,requestedBoardingTime,from,to,channelCategoryId,channelId,campaignId

    boarding=BoardingRequest.createBoardingRequest phoneNumber,requestedBoardingTime,from,to,channelCategoryId,channelId,campaignId
    TelephonyManager.sendSms phoneNumber,"Your Shuttl Boooking id is #{12034+boarding.id}. Please show this booking id to driver to board Shuttl."
    self.sendBoardingAssistanceMessage phoneNumber,from,to

  end


  def self.my_logger
    @@my_logger ||= Logger.new("#{Rails.root}/log/my.log")
  end


  def self.boardingReminder

    BoardingRequest.where(:reminder_sent => nil).where("requested_boarding_time>#{Time.now.to_i}").where("requested_boarding_time<#{Time.now.to_i+3600}").each do |board|
      message="Hello Shuttlr!! This is just a reminder message that you are scheduled to board Shuttl in next hour. "

      message=message+"If you have any queries regarding "+
          "pick up point/timings or any other assistance for boarding the Shuttl, please add +91-9015122792 to your whatsapp. "+
          "You can whatsapp us 24/7 for immediate resolution. We also have ground executives wearing Shuttl branded T-Shirts at pick up point to assist you in boarding Shuttl."
      TelephonyManager.sendSms board.phone_number,message
      puts "Sending reminder to "+board.phone_number
      TelephonyManager.sendSms board.phone_number,"+91-9015122792"
      board.reminder_sent=1
      board.save

    end

  end


  def self.boardingIVRCampaign

    self.sendBoardingIVRCampaignWithFromTo "ballabhgarh","Sector 62",17522

  end

  def self.sendBoardingIVRCampaignWithFromTo from,to,ivrCode

    LLead.where(:from=>from).where(:to=>to)
        .where("phone_number not in (select phone_number
    from boarding_requests where `from`='#{from}' and `to`='#{to}')").where("`from`='#{from}' and `to`='#{to}'").each do |llead|

      TelephonyManager.sendIvrCallTo ivrCode,llead.phone_number

    end

  end



end