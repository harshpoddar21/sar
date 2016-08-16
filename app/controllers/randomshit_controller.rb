class RandomshitController < ApplicationController


  def call
    #BookingObserver.new.checkIfNewBookingHappened [831,832]

    Transaction.refreshPledge
    UmsSubscription.refreshSubscribers
    render :text=>"OK"
  end

  def analyze

    allTabUsers=Array.new
    sugg=Hash.new

    GetSuggestionViaTab.where("(routeid is null or routeid=831) and make_booking=1").distinct!.each do |sug|
      sugg[sug.customer_number]=sug.created_at
      allTabUsers.push sug.customer_number
    end

    puts "total suggestions "+allTabUsers.length.to_s
    appUsers=UmsUser.where("PHONE_NUMBER in ("+allTabUsers.join(",")+")")
    userIds=Array.new
    userIdsMap=Hash.new

    appUsers.each do |app|
      userIdsMap[app["USER_ID"]]=app["PHONE_NUMBER"]
      userIds.push app["USER_ID"]
    end
    puts "total Downaloads "+userIds.length.to_s

    subs=UmsSubscription.where("USER_ID in ("+userIds.join(",")+")")

    subsBEarlier=Array.new
    subs.each do |sub|
      if sub["CREATED_TIME"]/1000<sugg[userIdsMap[sub["USER+ID"]]].to_i
        subsBEarlier.push sub

      end
    end
    puts "total Subs "+subs.size.to_s

    puts "total Subs Earlier"+subsBEarlier.size.to_s



  end


end