class GoogleDirection

  attr_accessor :overviewPolyline,:pickPoints

  GOOGLE_BASE_URL="https://maps.googleapis.com/maps/api/directions/json?sensor=false&units=metric&mode=driving&key=AIzaSyBvaX6apQloHSxGg6XHmY-l_LbUjyIIUkA"


  def initialize(points)

    self.pickPoints=points

  end

  def execute
    url=GOOGLE_BASE_URL+"&origin="+pickPoints[0]["lat"].to_s+","+pickPoints[0]["lng"].to_s
    url=url+"&destination="+pickPoints[pickPoints.size-1]["lat"].to_s+","+pickPoints[pickPoints.size-1]["lng"].to_s
    if pickPoints.size>2
      url=url+"&waypoints="
      ([1,pickPoints.size-2-22].max..pickPoints.size-2).each do |index|

        if(index==1)
          url=url+"via:"+pickPoints[index]["lat"].to_s+","+pickPoints[index]["lng"].to_s
        else
          url=url+"|via:"+pickPoints[index]["lat"].to_s+","+pickPoints[index]["lng"].to_s
        end

      end
    end
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

    over=""

    i=0
    while i<response["routes"][0]["legs"][0]["steps"].length
      if i<response["routes"][0]["legs"][0]["steps"].length-1
        over=over+response["routes"][0]["legs"][0]["steps"][i]["polyline"]["points"]+"|"
      else
        over=over+response["routes"][0]["legs"][0]["steps"][i]["polyline"]["points"]
      end
      i=i+1
    end
    self.overviewPolyline=over

  end
end
