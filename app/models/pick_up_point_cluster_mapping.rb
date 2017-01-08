class PickUpPointClusterMapping < ActiveRecord::Base

  def self.insertMapping locationId,pickUpPointName,clusterName
    mapping=find_by_from_id locationId
    if mapping!=nil
      mapping.name=pickUpPointName
      mapping.cluster=clusterName
      mapping.save
    else
      mapping=self.new
      mapping.from_id=locationId
      mapping.name=pickUpPointName
      mapping.cluster=clusterName
      mapping.save
    end

  end

  def self.getClusterNameFromLocationId locationId

    mapping=self.find_by_from_id locationId
    cluster=nil
    if mapping!=nil
      cluster=mapping.cluster
    end
    cluster
  end

end
