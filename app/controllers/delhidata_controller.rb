require 'csv'
class DelhidataController < ApplicationController

  def getDelhiWardData

    self.formats = [:json]
  end

  def delhiPopulationDist

  end

  def computeLinkDistance
    allData=Array.new

    CSV.foreach("/var/www/Ruby/sar/public/mindist.csv", :headers => true) do |row|

      allData.push row

    end
    distance=Array.new

    allData.each do |data1|
      puts data1[0]

      allData.each do |data2|
        if data1[0]!=data2[0]

          distance.push([data1[0],data2[0],LocationUtil.distance([data1[3].to_f,data1[4].to_f],[data2[1].to_f,data2[2].to_f])])

        else

          distance.push ([data1[0],data2[0],100000000000])

        end

      end
    end

    CSV.open( "/var/www/Ruby/sar/public/mindistfin.csv", 'w' ) do |writer|
      distance.each do |c|
        writer << c
      end
    end

  end


  def computePerpendiularDistance
    allData=Array.new

    CSV.foreach("/var/www/Ruby/sar/public/mindist.csv", :headers => true) do |row|

      allData.push row

    end
    distance=Array.new

    allData.each do |data1|
      puts data1[0]

      allData.each do |data2|
        if data1[0]!=data2[0] && LocationUtil.distance([data1[1].to_f,data1[2].to_f],[data2[1].to_f,data2[2].to_f])<3000 && LocationUtil.perpendicularDistance([data1[1].to_f,data1[2].to_f],[data1[3].to_f,data1[4].to_f],[data2[1].to_f,data2[2].to_f],[data2[3].to_f,data2[4].to_f])<=50

          distance.push([data1[0],data2[0]])

        else

#          distance.push ([data1[0],data2[0],100000000000])

        end

      end
      break

    end

    CSV.open( "/var/www/Ruby/sar/public/perpendFin.csv", 'w' ) do |writer|
      distance.each do |c|
        writer << c
      end
    end
  end
end