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
  #runner "BookingObserver.new.checkIfNewBookingHappened([831,832,242,578,579,243])"
end
every 2.minutes do
  #runner "ServiceController.new.refreshEtaForDiffPoints"
end

every 2.minutes do
  #runner "ServiceController.new.refreshPositionForDiffPoints"
end

every 10.minutes do
  runner "UmsSubscription.refreshSubscribers"
end

every 10.minutes do
  #runner "Transaction.refreshPledge"
end
every 1.hours do
  runner "DataUpdater.refreshFreshDeskData"
end
every 10.minutes do
  runner "Campaign.new.campaignPlanner"
end
every 1.day, :at => '5:30 am' do
  runner "ReportingController.new.postNumbersForRouteIds([960,964,219,136,962,482,983],{960=>[961],219=>[220],964=>[965],136=>[137],962=>[963],482=>[483,993],983=>[984]})"
end
every 1.day, :at => '3:32 pm' do
  runner "ReportingController.new.postNumbersForRouteIds([961,965,220,137,963,482,993,984],{961=>[960],220=>[219],965=>[964],137=>[136],963=>[962],483=>[482],993=>[482],984=>[983]})"
end

every 5.minutes do
  runner "LNewLeadCampaign.getOrganicLeads"
end

every 1.day, :at => '4:30 am' do
  runner "LLead.updateRideCount"
end
every 1.day, :at => '10:30 am' do
  runner "LLead.updateRideCount"
end
every 1.day, :at => '4:30 am' do
  runner "LLead.updateSubscriptionStatus"
end
every 1.day, :at => '10:30 am' do
  runner "LLead.updateSubscriptionStatus"
end


every 2.minutes do
  runner "BoardingCampaign.boardingReminder"
end

every 1.day, :at => '2:00 am' do
runner "BoardingCampaign.boardingSmsCampaignToPeopleWithNoAppRides"
end

every 1.day, :at => '11:00 am' do
  runner "BoardingCampaign.boardingSmsCampaignToPeopleWithNoAppRides"
end