class Affiliate < ActiveRecord::Base


  def self.exist? phoneNumber
    self.find_by(:phone_number=>phoneNumber)!=nil
  end

  def self.createANewAffiliate phoneNumber,agentId,isVerified

    self.create(:phone_number=>phoneNumber,:agent_id=>agentId,:is_verified => isVerified ? 1 : 0)

  end

  def self.getCountOfAffiliateByAgent agentId
    return self.where(:agent_id=>agentId).size
  end

end
