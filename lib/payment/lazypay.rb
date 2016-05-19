module Lazypay

  ACCESS_KEY="KI7RAM54A4FIO6BTBD39"
  SECRET_KEY="123a075a4bf21a6d91331c9575ac0f1aeb38e548"
  class URL
    BASE_URL=Rails.env.production? ? "http://lazypay.in":"http://test.lazypay.in"
    USER_ELIGIBLE=BASE_URL+"/api/lazypay/v0/payment/eligibility"
    INITIATE_PAYMENT=BASE_URL+"/api/lazypay/v0/payment/initiate"

  end
  def self.isUserEligible(phoneNumber,amount)

    requestParams=Hash.new
    requestParams["userDetails"]=Hash.new
    requestParams["amount"]=Hash.new
    requestParams["amount"]["value"]=amount.to_s+".00"
    requestParams["amount"]["currency"]="INR"
    requestParams["source"]="Shuttl"
    requestParams["userDetails"]["mobile"]=phoneNumber
    headers=Hash.new
    headers["signature"]=hmac_sha1 phoneNumber.to_s+amount.to_s+".00"+"INR",SECRET_KEY
    headers["accessKey"]=ACCESS_KEY
    headers["Content-Type"]="application/json"
    response=ConnectionManager.makePostHttpRequest URL::USER_ELIGIBLE,requestParams,headers,true
    return response

  end

  def self.hmac_sha1(data, secret)
    require 'base64'
    require 'cgi'
    require 'openssl'
    hmac = OpenSSL::HMAC.hexdigest(OpenSSL::Digest::Digest.new('sha1'), secret.encode("ASCII"), data.encode("ASCII"))
    return hmac
  end

  def self.initiatePayment email,phone,amount,transactionId,notifyUrl,returnUrl

    requestParams=Hash.new
    requestParams["userDetails"]=Hash.new
    requestParams["userDetails"]["mobile"]=phone
    if (email!=nil)
      requestParams["userDetails"]["email"]=email
    end

    requestParams["amount"]=Hash.new
    requestParams["amount"]["value"]=amount.to_s+".00"
    requestParams["amount"]["currency"]="INR"
    requestParams["merchantTxnId"]=transactionId
    requestParams["notifyUrl"]=notifyUrl
    requestParams["returnUrl"]=returnUrl
    requestParams["isRedirectFlow"]=false
    requestParams["source"]="Shuttl"
    headers=Hash.new
    headers["accessKey"]=ACCESS_KEY
    headers["Content-Type"]="application/json"
    signatureData="merchantAccessKey="+ACCESS_KEY+"&"+"transactionId="+transactionId.to_s+"&amount="+amount.to_s+".00"

    headers["signature"]=hmac_sha1 signatureData,SECRET_KEY

    response=ConnectionManager.makePostHttpRequest URL::INITIATE_PAYMENT,requestParams,headers,true

    response
  end

end