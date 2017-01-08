class BoardingSmsCampaignMessage < ActiveRecord::Base


  def self.getBoardingMessage phoneNumber,from,to,channelCategoryId,channelId,campaignId



    message=self.where(:from=>from,:to=>to).first


    if message==nil
      message=self.where(:from=>from,:to=>"default").first
      if message==nil
        message=self.where(:from=>"default",:to=>"default").first

      end

    end

    if message==nil
      message="Hi We are very excited to help you in making your office commute hassle free. "
    else
      message=message.message
    end


    message=message+"If you would like to book Shuttl click #{BitlyUtils.shortenUrl("http://urbanmetro.in/book_shuttl?data="+Utils.generateBase64(from,to,channelCategoryId,channelId,campaignId,phoneNumber))}" +". To stop click #{BitlyUtils.shortenUrl("http://urbanmetro.in/unsubscribe?data="+Utils.generateBase64(from,to,channelCategoryId,channelId,campaignId,phoneNumber))}"
    message

  end

  def self.insertMessage from,to,message1

    if from==nil || to==nil || message1==nil
      raise CustomError::ParamsException,"Invalid Parameters"
    end
    message=self.where(:from=>from).where(:to=>to).first

    if message==nil
      self.create(:from=>from,:to=>to,:message=>message1)
    else
      message.message=message1
      message.save
    end
  end

end
