class BoardingCampaign


  def self.sendBoardingRequestViaSms phoneNumber,from,to,channelCategoryId,channelId,campaignId


    message=self.generateBoardingMessageForCampaign from,to,channelCategoryId,channelId,campaignId,phoneNumber
    TelephonyManager.sendSms phoneNumber,message

  end


  def self.generateBoardingMessageForCampaign from,to,channelCategory,channelId,campaignId,phoneNumber

    response= "Hi We are very excited to help you in making your office commute hassle free. If" +" you would like to book Shuttl click #{BitlyUtils.shortenUrl("http://urbanmetro.in/book_shuttl?data="+Utils.generateBase64(from,to,channelCategory,channelId,campaignId,phoneNumber))}" +". To stop click #{BitlyUtils.shortenUrl("http://urbanmetro.in/unsubscribe?data="+Utils.generateBase64(from,to,channelCategory,channelId,campaignId,phoneNumber))}"

    response

  end


  def self.generateAppBoardingMessageForCampaign from,to,channelCategory,channelId,campaignId,phoneNumber

    response= "Hi We are very excited to help you in making your office commute hassle free. Please use the coupon code TRIAL for a free ride. To download app click here. http://bity.ly/downloadShuttl"

    response

  end
  def self.sendAppBoardingRequestViaSms phoneNumber,from,to,channelCategoryId,channelId,campaignId


    message=self.generateAppBoardingMessageForCampaign from,to,channelCategoryId,channelId,campaignId,phoneNumber
    TelephonyManager.sendSms phoneNumber,message

  end



end