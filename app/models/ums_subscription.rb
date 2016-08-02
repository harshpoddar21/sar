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



end