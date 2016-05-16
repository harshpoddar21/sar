module BitlyUtils

  USERNAME="harshpoddar21"
  API_KEY="R_ad270eebc6624243b3141ae410861728"
  def self.shortenUrl url
    bitly = Bitly.new(USERNAME, API_KEY)
    result=bitly.shorten url
    result.short_url
  end



end