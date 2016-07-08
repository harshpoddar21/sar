class UmsSubscription < ActiveRecord::Base
  establish_connection "ums_read_only_replica".to_sym

  self.table_name = "USER_SUBSCRIPTIONS"
end