class CustomercareController < ApplicationController


  def getData

    if !params[:fromDate] || !params[:toDate]
      render :json=>Response.new(false).to_json
      return
    end
    fromDate=params[:fromDate].to_date
    toDate=params[:toDate].to_date

    leads=Array.new
    if fromDate!=nil && toDate!=nil
      customers=GetSuggestionViaTab.where(:created_at=>fromDate..toDate)
      customers.each do |cust|
        leads.push NewLead.loadOrCreateByCustomer cust
      end

    end

    render :json=>Response.new(true,leads).to_json

  end





end



