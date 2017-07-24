class GoogleDirection

  attr_accessor :overviewPolyline,:pickPoints,:duration_in_traffic,:departureTime,:model,:distance

  GOOGLE_BASE_URL="https://maps.googleapis.com/maps/api/directions/json?sensor=false&units=metric&mode=driving&key=AIzaSyCLVshuBmW-UvxYLG-QGIH7zfJuesnnJBk&departure_time="


  def initialize(points,departureTime=Time.now.to_i,model="best_guess")

    self.pickPoints=points
    self.model =  model
    self.departureTime=departureTime == nil ? Time.now.to_i : departureTime
    puts points.to_json
  end

  def execute
    url=GOOGLE_BASE_URL+departureTime.to_s+"&traffic_model="+model+"&origin="+pickPoints[0]["lat"].to_s+","+pickPoints[0]["lng"].to_s
    url=url+"&destination="+pickPoints[pickPoints.size-1]["lat"].to_s+","+pickPoints[pickPoints.size-1]["lng"].to_s
    if pickPoints.size>2
      url=url+"&waypoints="
      puts url
      ([1,pickPoints.size-2-22].max..pickPoints.size-2).each do |index|

        if(index==1)
          url=url+"via:"+pickPoints[index]["lat"].to_s+","+pickPoints[index]["lng"].to_s
        else
          url=url+"|via:"+pickPoints[index]["lat"].to_s+","+pickPoints[index]["lng"].to_s
        end

      end
    end
    response=ConnectionManager::makeHttpRequest url
    puts response.body
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

    self.overviewPolyline=response["routes"][0]["overview_polyline"]["points"]
    self.duration_in_traffic=response["routes"][0]["legs"][0]["duration_in_traffic"]["value"]

    self.distance=response["routes"][0]["legs"][0]["distance"]["value"]

  end


end
