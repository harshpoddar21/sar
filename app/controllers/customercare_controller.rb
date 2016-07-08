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
        leads.push NewLead.loadOrCreateByCustomer cust
      end

    end

    render :json=>Response.new(true,leads).to_json

  end





end



