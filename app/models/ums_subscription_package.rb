class UmsSubscriptionPackage < ActiveRecord::Base

  establish_connection "ums_read_only_replica".to_sym

  self.table_name = "SUBSCRIPTION_PACKAGES"

  def self.findSubscriptionPackagesForRouteId routeId

    UmsSubscriptionPackage.where("ROUTE_ID = #{routeId} or RETURN_ROUTE_ID = #{routeId}")

  end


  def self.findSubscriptionPackagesIdsForRouteId routeId
    packages=self.findSubscriptionPackagesForRouteId routeId

    packageIds=Array.new
    packages.each do |package|
      packageIds.push package["SUBSCRIPTION_PACKAGE_ID"]
    end
    packageIds
  end




end