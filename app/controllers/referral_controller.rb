class ReferralController < ApplicationController


  def index

  end

  def makeTrialReqForUser

    response=Hash.new
    response["success"]=true
    response["referral_link"]=BitlyUtils.shortenUrl "http://myor.shuttl.com/referral/index"
    render :json=>response.to_json

  end

end