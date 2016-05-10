require 'net/http'
module ConnectionManager
  def self.makeHttpRequest url
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Get.new(uri.request_uri)
    http.use_ssl = true if  (/^https:/=~url) !=nil
    response = http.request(request)
  end
end
