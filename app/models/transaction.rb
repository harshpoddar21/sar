class Transaction < ActiveRecord::Base

  @@pledgedCached=Hash.new


  def self.isPledged? phoneNumber,cached=true

    if cached
      @@pledgedCached[phoneNumber]!=nil
    else
      Transaction.where(:phone_number => phoneNumber).where("status=1").size>0
    end

  end

  def self.refreshPledge
    @@pledgedCached=Hash.new

    Transaction.where("status=1").each do |tran|

      @@pledgedCached[tran[:phone_number]]=true

    end
  end
end
