class NewLead < ActiveRecord::Base


  SUBSCRIPTION_BOUGHT=1
  PLEDGE_BOUGHT=2
  SUBSCRIPTION_NOT_BOUGHT=0
  WHATSAPP_ADDED=1
  WHATSAPP_NOT_ADDED=0
  WHATSAPP_LEFT=0
  WHATSAPP_NOT_LEFT=1
  LEAD_NOT_INTERESTED=1
  LEAD_INTERESTED=0
  CALLED=1
  NOT_CALLED=0

  @subscriptionCached=nil
  @transactionCached=nil

    def self.loadOrCreateByCustomer customer,channel

      new_lead=self.find_by(:phone_number=>customer.customer_number)
      if new_lead==nil
        new_lead=NewLead.create(:phone_number=>customer.customer_number,:acquired_date=>customer.created_at,:from_location=>customer.from_str,:to_location=>customer.to_str,:channel=>channel)
      end
      new_lead
    end

  def self.sendSms phoneNumber,message

    lead=NewLead.find_by(:phone_number=>phoneNumber)

    if lead!=nil
      lead.count_link_sent=lead.count_link_sent==nil ? 1 : lead.count_link_sent+1
      lead.save
      TelephonyManager.sendSms lead.phone_number,message
    end
  end

  def self.changeCalledStatus phoneNumber,value
    new_lead=self.find_by(:phone_number=>phoneNumber)
    if new_lead==nil
      raise Exception,"Invalid phone number"
    else

      if value!=nil && (value.to_i==CALLED || value.to_i == NOT_CALLED)

        new_lead.called=value.to_i
        new_lead.save

      else

        raise Exception,"Invalid Value"

      end

    end
  end
  def self.changeInterestedStatus phoneNumber,value
    new_lead=self.find_by(:phone_number=>phoneNumber)
    if new_lead==nil
      raise Exception,"Invalid phone number"
    else

      if value!=nil && (value.to_i==LEAD_INTERESTED || value.to_i == LEAD_NOT_INTERESTED)

        new_lead.interested=value.to_i
        new_lead.save

      else

        raise Exception,"Invalid Value"

      end

    end
  end

  def self.changeResponse phoneNumber,value
    new_lead=self.find_by(:phone_number=>phoneNumber)
    if new_lead==nil
      raise Exception,"Invalid phone number"
    else

      if value!=nil

        new_lead.response=value
        new_lead.save

      else

        raise Exception,"Invalid Value"

      end

    end
  end

  def subscription_status
    if @subscriptionCached!=nil

      return @subscriptionCached
    end
    if self[:subscription_status]==SUBSCRIPTION_BOUGHT || self[:subscription_status]==PLEDGE_BOUGHT
      @subscriptionCached=self[:subscription_status]
      return self[:subscription_status]
    else

      if self.user_id>0 && UmsSubscription.where(:USER_ID=>self.user_id).size>0
        self.subscription_status=SUBSCRIPTION_BOUGHT
        @subscriptionCached=self.subscription_status
        self.save
      elsif Transaction.where(:phone_number => self.phone_number).where("status=1").size>0
        self.subscription_status=PLEDGE_BOUGHT
        @subscriptionCached=self.subscription_status
        self.save
      else
        @subscriptionCached=SUBSCRIPTION_NOT_BOUGHT
        return SUBSCRIPTION_NOT_BOUGHT
      end
    end
  end


  def user_id

    if self[:user_id] !=nil
       self[:user_id]
    else
      ums_user=UmsUser.find_by(:PHONE_NUMBER=>self.phone_number)
      if ums_user!=nil
        self.user_id=ums_user.USER_ID
        self.save
      else
        self.user_id=UmsUser::USER_NOT_FOUND_ID
      end
      self.user_id
    end
  end

  def whatsapp_status
    if self[:whatsapp_status]==nil
      return WHATSAPP_NOT_LEFT*2+WHATSAPP_NOT_ADDED
    end
  end





  def count_link_sent

    self[:count_link_sent]==nil ? 0 :self[:count_link_sent]
  end


  def count_clicked_on_negative
    self[:count_clicked_on_negative]==nil ? 0 :self[:count_clicked_on_negative]
  end

  def count_clicked_on_positive
    self[:count_clicked_on_positive]==nil ? 0 :self[:count_clicked_on_positive]
  end

  def called
    self[:called]==nil ? 0 : self[:called]

  end

  def interested
    whatsapp_status>>1==WHATSAPP_LEFT || count_clicked_on_negative>0 || self[:interested]==LEAD_NOT_INTERESTED ? LEAD_NOT_INTERESTED : LEAD_INTERESTED
  end

  def channel
    self[:channel]==nil ? "TAB":self[:channel]

  end


  def from_time

    if self[:from_time]==nil
      if channel=="TAB"
        sug=GetSuggestionViaTab.where(:customer_number=>self[:phone_number]).last
        if sug!=nil
          self.from_time=sug.from_time
          self.save
          self[:from_time]
        else
          self.from_time="NA"
          self.save
          self[:from_time]
        end
      end
    else
      self[:from_time]
    end
  end

  def to_time

    if self[:to_time]==nil
      if channel=="TAB"
        sug=GetSuggestionViaTab.where(:customer_number=>self[:phone_number]).last
        if sug!=nil
          self.to_time=sug.to_time
          self.save
        else
          self.to_time="NA"
          self.save
        end
      end
    else
      self[:to_time]
    end

  end


end
