class UmsRouteSubscription < ActiveRecord::Base
    establish_connection "ums_read_only_replica".to_sym
    self.table_name = "SUBSCRIPTIONS"
end