module BitlyUtils

  USERNAME="harshpoddar21"
  API_KEY="R_ad270eebc6624243b3141ae410861728"
  def self.shortenUrl url
    short=nil
    begin

      bitly = Bitly.new(USERNAME, API_KEY)
      result=bitly.shorten url
      short=result.short_url

    rescue Exception => error

      short=Googl.shorten(url,"","AIzaSyDwY1YUoIsaJl6f9ouaUZCiCGekccqjkkQ").short_url

    end
    short


  end



end