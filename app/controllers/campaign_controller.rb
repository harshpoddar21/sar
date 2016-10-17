class CampaignController < ApplicationController


  def unsubscribeUser

    phoneNumber=params[:phoneNumber]

    Campaign.unsubscribeFromCampaign phoneNumber

    render :text=>"OK"

  end

  def sendFollowUpToUnsubscriber

    targetingStart=params[:targetingStart]
    targetingEnd=params[:targetingEnd]
    routeId=params[:routeId].split(",")
    Campaign.new.sendSubscriptionCampaignToAcquiredUser targetingStart.to_i,targetingEnd.to_i,routeId
    render :text=>"Sent"
  end
end