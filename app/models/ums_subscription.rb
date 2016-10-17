class UmsSubscription < ActiveRecord::Base
  establish_connection "ums_read_only_replica".to_sym

  self.table_name = "USER_SUBSCRIPTIONS"

  @@subscribedPeople=Hash.new

  def self.isSubscribed? userId,cached=true

    if cached

      @@subscribedPeople[userId]!=nil

    else
      UmsSubscription.where(:USER_ID=>self.user_id).size>0
    end

  end


  def self.refreshSubscribers
    @@subscribedPeople=Hash.new
    UmsSubscription.all.each do |subs|
      @@subscribedPeople[subs[:USER_ID]]=true
    end
  end




  def self.findUnsubscribedUsers allUsers

    if allUsers!=nil && allUsers.is_a?(Array)
      if allUsers.size>0
        subscribers=Array.new
        UmsSubscription.joins(" join USERS on USERS.USER_ID=USER_SUBSCRIPTIONS.USER_ID ").where("USERS.PHONE_NUMBER in ("+allUsers.join(",")+")").each do |sub|
          subscribers.push sub["PHONE_NUMBER"]
        end

      else
        return Array.new

      end

    else
      raise Exception,"Invalid Arguments"
    end


    allUsers-subscribers
  end



end