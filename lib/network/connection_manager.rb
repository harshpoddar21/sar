require 'net/http'
module ConnectionManager
  def self.makeHttpRequest url,headers={},requestParams={}
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Get.new(uri.request_uri)
    http.use_ssl = true if  (/^https:/=~url) !=nil
    response = http.request(request)
  end


  def self.makePostHttpRequest url,requestParams={},headers={},sendAsRaw=false
    uri = URI.parse url
    req = Net::HTTP::Post.new(uri, initheader = headers==nil ? {'Content-Type' =>'application/json'}:headers)
    req.body = sendAsRaw ? requestParams.to_json : requestParams
    res = Net::HTTP.start(uri.hostname, uri.port) do |http|
      http.request(req)
    end
    puts res
    res
  end
end
