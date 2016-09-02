require 'net/http'
module ConnectionManager
  def self.makeHttpRequest url,headers={},requestParams={}
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Get.new(uri.request_uri)
    headers.each do |key,value|
      request.add_field key,value
    end
    http.use_ssl = true if  (/^https:/=~url) !=nil
    response = http.request(request)
    return response
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


  def self.postRequest(url,data,port)
    uri = URI.parse(url)
    https = Net::HTTP.new(uri.host,port)
    req = Net::HTTP::Post.new(uri.path, initheader = {'Content-Type' => 'application/json'})
    req.body = data.to_json
    response = https.request(req)
    return response
  end
end
