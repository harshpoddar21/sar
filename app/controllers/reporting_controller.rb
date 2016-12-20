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

      subscriptionNos=Report.sendSubscriptionSoldInLastXDays routeIds,5
      Prawn::Document.generate("subscription_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|


        data=Array.new
        data.push(["Route Id","Day 1","Day 2","Day 3","Day 4","Day 5"])
        subscriptionNos.each do |routeId,subsNo|
          res=[routeId]
          subsNo.each do |sub|
            res.push sub

          end
          data.push(res)
        end

        pdf.table(data,:header=>true)

      end


    else

      raise CustomError::ParamsException,"Invalid Params"

    end



    totalSubscriptionSold=Array.new
    routeIds.each do |routeId|
      totalSubscriptionSold.push(Report.getTotalAndUniqueSubscriptionSold(routeId))
    end

    Prawn::Document.generate("total_subscription_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|

      data=Array.new
      data.push(["Route Id","Unique Subs","Total Subs"])

      totalSubscriptionSold.each do |subs|
        data.push([subs["routeId"],subs["unique"],subs["total"]])
      end
      pdf.table(data,:header=>true)

    end

  end



end