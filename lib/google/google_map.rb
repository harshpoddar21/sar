module GoogleMap

  API_KEY=""
  class GoogleDirection
    BASE_URL="https://maps.googleapis.com/maps/api/directions/json?key="+API_KEY
    @origin
    @destination

    def initialize origin,destination,opts={}

    end
    def getDistance

    end
  end

end