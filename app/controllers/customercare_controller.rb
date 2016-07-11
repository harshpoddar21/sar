class CustomercareController < ApplicationController


  def getData

    if !params[:fromDate] || !params[:toDate]
      render :json=>Response.new(false).to_json
      return
    end
    fromDate=params[:fromDate]
    toDate=params[:toDate]

    leads=Array.new
    if fromDate!=nil && toDate!=nil
      customers=GetSuggestionViaTab.where("unix_timestamp(created_at)>=#{fromDate} and unix_timestamp(created_at)<=#{toDate}")
      customers.each do |cust|
        leads.push NewLead.loadOrCreateByCustomer cust,"TAB"
      end

      customers=RouteSuggestionCombined.where("unix_timestamp(DATE_CREATED)>=#{fromDate} and unix_timestamp(DATE_CREATED)<=#{toDate}").where("ROUTE_ID in (831,832,64)")
      customers.each do |cust|
        leads.push NewLead.loadOrCreateByCustomer cust,cust.channel
      end

      customers=CustomerSuggestion.where("unix_timestamp('created_at')>=#{fromDate} and unix_timestamp(created_at)<=#{toDate}").where("routeid in (831,832,64)")
      customers.each do |cust|
        leads.push NewLead.loadOrCreateByCustomer cust,"myor"
      end






    end

    render :json=>Response.new(true,leads).to_json

  end


  def update_lead_data
    key=params[:key]
    value=params[:value]
    phoneNumber=params[:phone_number]

    if key==nil || value==nil || phoneNumber==nil
      raise CustomError::ParamsException,"Invalid Input"
    end

    if key=="called"
      NewLead.changeCalledStatus phoneNumber,value
    elsif key=="interested"
      NewLead.changeInterestedStatus phoneNumber,value
    elsif key=="response"
      NewLead.changeResponse phoneNumber,value
    else
      raise Exception,"Invalid Key"
    end

    render :json=>Response.new(true,{}).to_json
  end

  def sendSMS
    content=params[:content]
    pLink=params[:pLink]
    nLink=params[:nLink]
    phoneNumber=params[:phone_number]
    lead=NewLead.find_by(:phone_number=>phoneNumber)

    if content!=nil && lead!=nil
      urlSh=UrlShortener.create(:new_lead_id=>lead.id,:p_link=>pLink,:n_link=>nLink)

      content.gsub! "{pLink}",urlSh.getPositiveLinkShortened if pLink!=nil
      content.gsub! "{nLink}",urlSh.getNegativeLinkShortened if nLink!=nil
      NewLead.sendSms phoneNumber,content
    end


    render :json=>Response.new(true,{}).to_json
  end



end



