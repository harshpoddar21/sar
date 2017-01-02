class LChannelCategory < ActiveRecord::Base



  def self.findChannelByIdentifier name

    self.find_by_channel_category_id name

  end

end
