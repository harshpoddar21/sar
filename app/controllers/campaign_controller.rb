class CampaignController < ApplicationController


  def unsubscribeUser

    phoneNumber=params[:phoneNumber]

    Campaign.unsubscribeFromCampaign phoneNumber

    redirect_to "https://docs.google.com/a/shuttl.com/forms/d/e/1FAIpQLSe95v0C2VakBXZkAFN6tOM5wL2NoyULBdbzeJF0AMuuTr7zCQ/viewform?entry.361896514=#{phoneNumber}"

  end

  def sendFollowUpToUnsubscriber

    targetingStart=params[:targetingStart]
    targetingEnd=params[:targetingEnd]
    routeId=params[:routeId].split(",")
    Campaign.new.sendSubscriptionCampaignToAcquiredUser targetingStart.to_i,targetingEnd.to_i,routeId
    render :text=>"Sent"
  end
end