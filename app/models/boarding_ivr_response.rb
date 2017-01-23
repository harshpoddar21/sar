class BoardingIvrResponse < ActiveRecord::Base

  def self.saveResponse phoneNumber,response

      self.create(:phone_number=>phoneNumber,:response=>response)

      if response.to_i==1
        lead=LLead.find_by_phone_number phoneNumber


        if lead!=nil
          BoardingCampaign.sendBoardingRequestViaSms phoneNumber,lead.from,lead.to,"ivr","ivr_calling","automated_ivr_boarding"
          TelephonyManager.sendSms "8800846150","Please on board customer travelling from #{lead.from} to #{lead.to} with phone number #{lead.phone_number}"
          TelephonyManager.sendSms "9015122792","Please on board customer travelling from #{lead.from} to #{lead.to} with phone number #{lead.phone_number}"

        else
          puts "lead not found"
        end

      else response.to_i==2
        LUnsubscribe.createIssueForLead phoneNumber,"unsubscribed by user","ivr","ivr_calling","automated_ivr_boarding"
      end

    true


  end

end
