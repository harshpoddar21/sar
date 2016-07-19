class RandomshitController < ApplicationController


  def call
    BookingObserver.new.checkIfNewBookingHappened [831,832]
  end
end