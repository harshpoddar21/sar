class LUnsubscribe < ActiveRecord::Base


  def self.createIssueForLead phoneNumber,issue,channelCategoryId,channelId,campaignId

    self.create(:phone_number=>phoneNumber,:issue_id=>issue,:category_channel_id=>channelCategoryId,:channel_id=>channelId,:campaign_id=>campaignId)

  end

end
