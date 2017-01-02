class LChannel



  def self.findChannelByCategoryAndChannelIdentifier channelCategory,channelIdentifier

    if channelCategory==LBtlChannel.channelCategoryIdentifier # try to remove this

      LBtlChannel.findChannelByIdentifier channelIdentifier

    end
  end

end