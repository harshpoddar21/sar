require "prawn"

class ReportingController < ApplicationController

  def postNumbersForRouteIds routeIds


    if routeIds.is_a? Array

      bookingNos=Report.getBookingNumbersForToday routeIds

      Prawn::Document.generate("booking_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|


        data=Array.new
        data.push(["Route Id","Booking No"])
        bookingNos.each do |bookingNo|
          data.push([bookingNo["ROUTE_ID"],bookingNo["BOOKING_COUNT"]])
        end

        pdf.table(data,:header=>true)

      end


    else

      raise CustomError::ParamsException,"Invalid Params"

    end

  end

end