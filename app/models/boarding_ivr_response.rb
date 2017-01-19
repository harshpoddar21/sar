class BoardingIvrResponse < ActiveRecord::Base

  def self.saveResponse phoneNumber,response

      self.create(:phone_number=>phoneNumber,:response=>response)

      if response.to_i==1
        lead=LLead.find_by_phone_number phoneNumber
        if lead!=nil
          BoardingCampaign.sendAppBoardingRequestViaSms phoneNumber,lead.from,lead.to,"ivr","ivr_calling","automated_ivr_boarding"
        else
          puts "lead not found"
        end

      end

    true


  end

end
