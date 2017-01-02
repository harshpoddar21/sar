class LBtlChannel < ActiveRecord::Base


  @@channelCategoryIdentifier="btl"


  def self.findChannelByIdentifier channelIdentifier

    self.find_by_channel_id channelIdentifier

  end

end
