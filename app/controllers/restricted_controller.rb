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
    response=params[:input]

    isSuccess=Feedback.recordResponseFromUser phoneNumber,Feedback::Channel::VIA_CALL,response

    if !isSuccess
      logger.error "Cannot save feedback from caller "+phoneNumber.to_s+" and response "+response

    end

    render :text=>"OK"
  end

end