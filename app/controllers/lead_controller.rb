class LeadController < ApplicationController

  after_filter  :set_access_control_headers


  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
  end


  def submitNewLead


    phoneNumber=params[:phoneNumber]
    answer=params[:answers]
    prefilledAnswer=params[:prefilledAnswer]
    isInterested=params[:isInterested]

    campaignId=params[:utm_campaign]
    channelCategory=params[:utm_source]
    channelId=params[:utm_medium]
    from=params[:from]
    to=params[:to]
    modeOfCommute=params[:moc]




    if phoneNumber!=nil && answer!=nil && isInterested!=nil


      result=LNewLeadCampaign.saveNewLeadAndAttemptBoarding phoneNumber,answer,isInterested,prefilledAnswer,channelCategory,channelId,from,to,modeOfCommute,campaignId

      render :json=>result.to_json
    else
      render :json=>{:success=>false,:message=>"You have already applied for a free trial"}.to_json
    end


  end


  def checkAndAddCampaignParameters


    utm_source=params[:utm_source]

    channelCategory=LChannelCategory.findChannelByIdentifier utm_source

    if channelCategory==nil
      params[:channel_category]=-1
    else
      params[:channel_category]=channelCategory.id
    end

    utm_medium=params[:utm_medium]

    channel=LChannel.findChannelByCategoryAndChannelIdentifier utm_source,utm_medium

    if channel==nil
      params[:channel_id]=-1
    else
      params[:channel_id]=channel.id

    end


    params[:campaign_id]=params[:utm_campaign]


  end


end