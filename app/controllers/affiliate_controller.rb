class AffiliateController < ApplicationController

  def registerAffiliate

  end


  def submitEntry

    phoneNumber=params[:phoneNumber]
    agentId=params[:agentId]
    otp=params[:otp]
    resp=Hash.new
    otpM=OtpMessage.where("phone_number="+phoneNumber.to_s).last
    if otpM.otp.to_s==otp.to_s
      if !Affiliate.exist? phoneNumber
        Affiliate.createANewAffiliate(phoneNumber,agentId)
        resp["errorMessage"]=""
        resp["status"]="OK"
        resp["affiliateCount"]=Affiliate.getCountOfAffiliateByAgent agentId
      else
        resp["errorMessage"]="Affilate already registered"
        resp["status"]="ERROR"
      end
    else
      resp["errorMessage"]="OTP not correct"
      resp["status"]="ERROR"
    end
    render :json=>resp.to_json
  end
end