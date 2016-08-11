module LocationUtil
  def self.distance loc1, loc2
    rad_per_deg = Math::PI/180  # PI / 180
    rkm = 6371                  # Earth radius in kilometers
    rm = rkm * 1000             # Radius in meters

    dlat_rad = (loc2[0]-loc1[0]) * rad_per_deg  # Delta, converted to rad
    dlon_rad = (loc2[1]-loc1[1]) * rad_per_deg

    lat1_rad, lon1_rad = loc1.map {|i| i * rad_per_deg }
    lat2_rad, lon2_rad = loc2.map {|i| i * rad_per_deg }

    a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad/2)**2
    c = 2 * Math::atan2(Math::sqrt(a), Math::sqrt(1-a))

    rm * c # Delta in meters
  end

  def self.perpendicularDistance loc1, loc2,loc3,loc4

    diffInLng=97756
    diffInLat=111194
    x1=loc1[0]*diffInLat
    x2=loc2[0]*diffInLat
    y1=loc1[1]*diffInLng
    y2=loc2[1]*diffInLng
    x3=loc3[0]*diffInLat
    x4=loc4[0]*diffInLat
    y3=loc3[1]*diffInLng
    y4=loc4[1]*diffInLng
    area1=0.5*(x1*y2 + x2*y3 + x3*y1 - x2*y1 - x3*y2 - x1*y3)
    area1=area1.abs
    area2=0.5*(x1*y2 + x2*y4 + x4*y1 - x2*y1 - x4*y2 - x1*y4)
    area2=area2.abs
    base1=Math.sqrt((x2-x1)**2+(y2-y1)**2)

    base2=base1

    height1=area1*2/base1
    height2=area2*2/base2

    return height1>height2 ? height2:height1


  end



end