class RandomshitController < ApplicationController


  def call
    #BookingObserver.new.checkIfNewBookingHappened [831,832]

    Campaign.new.campaignPlanner
    render :text=>"OK"
  end
end