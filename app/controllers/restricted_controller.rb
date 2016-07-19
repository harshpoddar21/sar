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


  def feedbackReceived

    phoneNumber=params[:caller]
    keypress=params[:keypress]
    logger.info params.to_json
    render :text=>"OK"
  end

end