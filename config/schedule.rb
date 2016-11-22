# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
 set :output, "/var/log/cron/schedule_sar_cron.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever
every 3.minutes do
  runner "BookingObserver.new.checkIfNewBookingHappened([831,832,242,578,579,243])"
end
every 2.minutes do
  runner "ServiceController.new.refreshEtaForDiffPoints"
end

every 2.minutes do
  runner "ServiceController.new.refreshPositionForDiffPoints"
end

every 10.minutes do
  runner "UmsSubscription.refreshSubscribers"
end

every 10.minutes do
  runner "Transaction.refreshPledge"
end
every 1.hours do
  #runner "DataUpdater.refreshFreshDeskData"
end
every 10.minutes do
  runner "Campaign.new.campaignPlanner"
end
