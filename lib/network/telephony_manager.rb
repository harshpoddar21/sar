module TelephonyManager

  def self.sendIvrCall(number)
    url=URI.parse("http://voice.sinfini.com/api/v1/index.php?api_key=A08c15a6f74423b20addc4ab5dc2fdedb&method=voice.call&play=6677.ivr&numbers=#{number}&format=json")
    response = Net::HTTP.get(url)
    response=JSON.parse(response)
    puts response
    return response["status"]
  end

end
