class MessageTracker

  PREFIX_FOR_MESSAGE="message/"
  def self.sendMessage number,message,onlyOnce=false,identifier
    if onlyOnce
      if identifier!=nil
        isMessageSent=Rails.cache.fetch(PREFIX_FOR_MESSAGE+identifier.to_s)
        if !isMessageSent
          TelephonyManager.sendSms number,message
          Rails.cache.write(PREFIX_FOR_MESSAGE+identifier.to_s,"sent")
        end
      else
        raise Exception,"Identifier cannot be null"
      end
    else
      TelephonyManager.sendSms number,message
    end
  end

end