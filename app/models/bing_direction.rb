class BingDirection
  attr_accessor :overviewPolyline,:pickPoints,:duration_in_traffic,:departureTime

  BING_BASE_URL="http://dev.virtualearth.net/REST/v1/Routes?optimize=timeWithTraffic&key=AglarACLmIc0Rnz-Urk_yu0JlTG3N5MIDtivOPStQ-7QfKazTT4NIvStDVwXMLBd"


  def initialize(points,departureTime=Time.now.to_i)

    self.pickPoints=points
    self.departureTime=departureTime == nil ? Time.now.to_i : departureTime

  end

  def execute
    url=BING_BASE_URL+"&wp.1="+pickPoints[0]["lat"].to_s+","+pickPoints[0]["lng"].to_s

    if pickPoints.size>2

      ([1,pickPoints.size-2-22].max..pickPoints.size-2).each do |index|

        if(index==1)
          url=url+"&wp.#{index+1}="+pickPoints[index]["lat"].to_s+","+pickPoints[index]["lng"].to_s
        else
          url=url+"&wp.#{index+1}="+pickPoints[index]["lat"].to_s+","+pickPoints[index]["lng"].to_s
        end

      end
    end
    url=url+"&wp.#{pickPoints.size}="+pickPoints[pickPoints.size-1]["lat"].to_s+","+pickPoints[pickPoints.size-1]["lng"].to_s
    response=ConnectionManager::makeHttpRequest url
    if (response!=nil && response.body!=nil)
      begin
        response=JSON.parse response.body
        parseResponse response
      rescue Exception=>e
        puts "Exception"
        # logger.error "error ocurred while parsing google directions"
      end


    end
  end

  def parseResponse response

    self.duration_in_traffic=response["resourceSets"][0]["resources"][0]["travelDurationTraffic"]

  end


end