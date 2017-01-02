class LLead < ActiveRecord::Base



  def self.constructLeadFromAnswer answer,isInterested,prefilledAnswer,channelCategory,channelId,from,to,modeOfCommute,campaignId


    lead=LLead.new
    lead.is_interested=isInterested
    lead.prefilled_answer=prefilledAnswer
    lead.channel_category_id=channelCategory
    lead.channel_id=channelId
    lead.answer=answer
    lead.from=from
    lead.to=to
    lead.mode_of_comute=modeOfCommute
    lead.campaign_id=campaignId
    lead

  end


  def self.getAnswerToQuestionNo answer,questionNo

    return ((Utils.hexToDecimal(answer) % (16<<(questionNo-1)) - Utils.hexToDecimal(answer) % (16<<questionNo-2))) / (16<<(questionNo-2));

  end

  def self.isValidLead? phoneNumber


    self.find_by_phone_number(phoneNumber)==nil

  end





end
