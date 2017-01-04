class LQuery < ActiveRecord::Base



  def self.createQueryForLead phoneNumber,response,campaignId,channelId,channelCategoryId

    query=LQuery.new
    query.phone_number=phoneNumber
    query.campaign_id=campaignId
    query.channel_id=channelId
    query.channel_category_id=channelCategoryId
    query.query=response
    query.save


  end

end
