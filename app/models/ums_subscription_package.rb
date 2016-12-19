class UmsSubscriptionPackage < ActiveRecord::Base

  establish_connection "ums_read_only_replica".to_sym

  self.table_name = "SUBSCRIPTION_PACKAGES"

  def self.findSubscriptionPackagesForRouteId routeId

    UmsSubscriptionPackage.where("ROUTE_ID = #{routeId}").where("REVERSE_ROUTE_ID = #{routeId}")

  end




end