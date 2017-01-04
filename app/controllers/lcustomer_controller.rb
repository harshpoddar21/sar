class LcustomerController < ApplicationController

  def getData

    from=params[:from]
    to=params[:to]

    allLeads=LLead.findAllLeadsStartingFromAndTo from,to

    queriesResult=Array.new
    phoneNumbers=Array.new
    allLeads.each do |lead|
      phoneNumbers.push lead["phone_number"]
    end
    queries=Hash.new
    queriesAll=LQuery.where("phone_number in (#{phoneNumbers.join(",")})")
    queriesAll.each do |query|
      if queries[query.phone_number]!=nil
        queries[query.phone_number].push query.query
      else
        queries[query.phone_number]=Array.new
        queries[query.phone_number].push query.query
      end
    end
    allLeads.each do |lead|
      if queries[lead["phone_number"]]==nil
        lead["past_response"]=[]
      else
        lead["past_response"]=queries[lead["phone_number"]]
      end
    end

    render :json=>allLeads.to_json

  end


  def updateLeadData

    phoneNumber=params[:phone_number]
    currentResponse=params[:current_response]
    boardingReq=params[:send_boarding_request]
    channelId=params[:channel_id]
    campaignId=params[:campaign_id]
    issue=params[:issue]
    channelCategoryId=params[:channel_category_id]
    if currentResponse!=nil
      LQuery.createQueryForLead phoneNumber,currentResponse,campaignId,channelId,channelCategoryId
    end
    if boardingReq!=nil
      lead=LLead.find_by_phone_number phoneNumber
      from= lead.from ? lead.from : "Home"
      to=lead.to ? lead.to : "Office"
      BoardingCampaign.sendAppBoardingRequestViaSms phoneNumber,from,to,channelCategoryId,channelId,campaignId
    end

    if issue!=nil

      LUnsubscribe.createIssueForLead phoneNumber,issue,channelCategoryId,channelId,campaignId

    end
    render :text =>"OK"
  end



end