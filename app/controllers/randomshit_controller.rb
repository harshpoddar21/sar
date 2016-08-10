class RandomshitController < ApplicationController


  def call
    #BookingObserver.new.checkIfNewBookingHappened [831,832]

    Transaction.refreshPledge
    UmsSubscription.refreshSubscribers
    render :text=>"OK"
  end



end