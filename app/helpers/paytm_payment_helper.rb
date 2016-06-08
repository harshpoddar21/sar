module PaytmPaymentHelper

  def getRequestType
    return "DEFAULT"
  end

  def getMID
    if (Rails.env.production?)
      return "SUPERM32131698365846"
    else
      return "Superh25717328284467"
    end
  end

  def getWebsite
    if (Rails.env.production?)
      return "SUPERweb"
    else
      return "SUPERweb"
    end
  end


  def getMerchantKey
    if (Rails.env.production?)
      return "gUaq_NPvRlz3JWYI"
    else
      return "umnH0&6DDZK2ngoJ"
    end
  end

  def getChannelId
    return "WAP"

  end

  def getIndustryTypeId

    return "Retail"

  end

  def getTransactionId(transaction)

    return "myor_"+transaction.id.to_s

  end

  def getCustomerId(transaction)

    return transaction.phone_number
  end

  def getTransactionAmount transaction

    return transaction.amount.to_s+".00"

  end


  def getCheckSumForTransaction transaction

    req=Hash.new
    req["REQUEST_TYPE"]=getRequestType
    req["MID"]=getMID
    req["ORDER_ID"]=getTransactionId transaction
    req["CUST_ID"]=getCustomerId transaction
    req["TXN_AMOUNT"]=getTransactionAmount transaction
    req["CHANNEL_ID"]=getChannelId
    req["INDUSTRY_TYPE_ID"]=getIndustryTypeId
    req["WEBSITE"]=getWebsite
    #req["Callback_URL"]=getCallbackUrl
    ChecksumTool.new.get_checksum_hash(req)
  end

  def getCallbackUrl

    return "https://myor.shuttl.com/payment/paymentDone"
  end

  def getActionUrl
    actionUrl=!Rails.env.production? ? "https://pguat.paytm.com/oltp-web/processTransaction": "https://secure.paytm.in/oltp-web/processTransaction"
    return actionUrl
  end




end