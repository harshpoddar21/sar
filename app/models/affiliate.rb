class Affiliate < ActiveRecord::Base


  def self.exist? phoneNumber
    self.find_by(:phone_number=>phoneNumber)!=nil
  end

  def self.createANewAffiliate phoneNumber,agentId

    self.create(:phone_number=>phoneNumber,:agent_id=>agentId)

  end

  def self.getCountOfAffiliateByAgent agentId
    return self.where(:agent_id=>agentId).size
  end

end
