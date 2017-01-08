class BoardingRequest < ActiveRecord::Base

  def self.findLastBoardingByChannelId channelCategoryId

    self.where(:channel_id => channelCategoryId).last


  end

  def self.createBoardingRequest phoneNumber,requestedBoardingTime,from,to,channelCategoryId,channelId,campaignId

    boarding=BoardingRequest.create(:phone_number=>phoneNumber,:requested_boarding_time=>requestedBoardingTime,:from=>from,:to=>to,:channel_category_id=>channelCategoryId,:channel_id=>channelId,:campaign_id=>campaignId)
    boarding
  end

end
