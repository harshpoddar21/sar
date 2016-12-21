require "prawn"

class ReportingController < ApplicationController

  def postNumbersForRouteIds routeIds,relatedRouteIds


    files=Array.new

    if routeIds.is_a? Array





      bookingNos=Report.getBookingNumbersForToday routeIds


      Prawn::Document.generate("booking_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|


        files.push("booking_numbers_#{Time.now.strftime("%F")}.pdf")
        data=Array.new
        data.push(["BOOKING NUMBERS"])
        data.push(["Route Id","Booking No"])
        bookingNos.each do |bookingNo|
          data.push([bookingNo["ROUTE_ID"],bookingNo["BOOKING_COUNT"]])
        end

        pdf.table(data,:header=>true)

      end

      subscriptionNos=Report.sendSubscriptionSoldInLastXDays routeIds,5
      Prawn::Document.generate("subscription_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|

        files.push("subscription_numbers_#{Time.now.strftime("%F")}.pdf")

        data=Array.new

        data.push(["SUBSCRIPTIONS SOLD"])
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
    totalSubscriptionSold=Array.new
    routeIds.each do |routeId|
      totalSubscriptionSold.push(Report.getTotalAndUniqueSubscriptionSold(routeId))
    end

    Prawn::Document.generate("total_subscription_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|

      files.push("total_subscription_numbers_#{Time.now.strftime("%F")}.pdf")
      data=Array.new
      data.push(["TOTAL SUBSCRIPTIONS"])
      data.push(["Route Id","Unique Subs","Total Subs"])

      totalSubscriptionSold.each do |subs|
        data.push([subs["routeId"],subs["unique"],subs["total"]])
      end
      pdf.table(data,:header=>true)

    end


    newUserBooked=Hash.new

    routeIds.each do |routeId|

      if relatedRouteIds[routeId]

        newUserBooked[routeId]=Report.getNewUserCountInLastXDays([routeId]+relatedRouteIds[routeId],5)

      else

        newUserBooked[routeId]=Report.getNewUserCountInLastXDays([routeId],5)
      end

    end
    Prawn::Document.generate("new_user_booked_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|


      files.push("new_user_booked_numbers_#{Time.now.strftime("%F")}.pdf")
      data=[["NEW USER BOOKED"]]
      data.push(["Route Id","Day 1","Day 2","Day 3","Day 4","Day 5"])

      puts newUserBooked
      newUserBooked.each do |routeId,value|

        puts value
        data.push([routeId]+value)
      end

      pdf.table(data,:header=>true)
    end

    else

      raise CustomError::ParamsException,"Invalid Params"

    end





    Prawn::Document.generate("boarding_numbers_#{Time.now.strftime("%F")}.pdf") do |pdf|

      files.push("new_user_booked_numbers_#{Time.now.strftime("%F")}.pdf")
      data=[["Boarding Numbers"]]
      data.push(["Route Id","Boarding"])
      routeIds.each do |routeId|

       boardingNos=Report.getBoardingNumberRouteIdWise routeId,Utils.getTodayMorningUnixTime,(Utils.getTodayMorningUnixTime+Constants::SECONDS_IN_DAY)

       data.push([routeId.to_s,boardingNos.to_s])
      end
      pdf.table(data,{:header=>true})

    end


    files.each do |file|


      PdfMailer.sendFile("harsh.poddar@shuttl.com","/var/www/sar/#{file}",file).deliver_now

      PdfMailer.sendFile("guneet.singh@shuttl.com","/var/www/sar/#{file}",file).deliver_now

      PdfMailer.sendFile("nitish.kumar@shuttl.com","/var/www/sar/#{file}",file).deliver_now

      PdfMailer.sendFile("shantanu.garg.ext@shuttl.com","/var/www/sar/#{file}",file).deliver_now

      PdfMailer.sendFile("archit.raheja@shuttl.com","/var/www/sar/#{file}",file).deliver_now

    end




  end



end