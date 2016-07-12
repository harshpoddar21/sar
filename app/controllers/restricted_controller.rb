class RestrictedController < ApplicationController


  def getDetailsForLead

    phoneNumber=params[:caller]
    newLead=GetSuggestionViaTab.find_by(:customer_number=>phoneNumber)

    if newLead!=nil

      fromLocationName=newLead.from_str
      toLocationName=newLead.to_str


    end

    render :text=>"200|from={say:#{fromLocationName}};to={say:#{toLocationName}}"
  end


end