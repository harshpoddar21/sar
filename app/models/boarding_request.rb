class BoardingRequest < ActiveRecord::Base

  def self.findLastBoardingByChannelId channelCategoryId

    self.where(:channel_id => channelCategoryId).last


  end

end
