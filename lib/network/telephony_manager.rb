module TelephonyManager

  def self.sendIvrCall(number)
    url=URI.parse("http://voice.sinfini.com/api/v1/index.php?api_key=A08c15a6f74423b20addc4ab5dc2fdedb&method=voice.call&play=6677.ivr&numbers=#{number}&format=json")
    response = Net::HTTP.get(url)
    response=JSON.parse(response)
    puts response
    return response["status"]
  end

  def self.sendFeedbackIvrCall phoneNumber
    url=URI.parse "http://obd.solutionsinfini.com/api/v1/index.php?api_key=A0fcc01eb0baa771dffcc02a8c1c55751&method=voice.call&play=12349.ivr&numbers="+phoneNumber.to_s+"&format=json"
    response = Net::HTTP.get(url)
    response=JSON.parse(response)
    return response["message"]
  end


  def self.sendSms number,message

    if (number!=nil && message!=nil)
      resp=ConnectionManager.makeHttpRequest "http://alerts.solutionsinfini.com/api/web2sms.php?workingkey=A9b72ac822242669f869659438ea113e2&to=#{number}&sender=SHUTTL&message="+message
      return true
    else

      return false

    end


  end

end
