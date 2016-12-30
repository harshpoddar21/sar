class LeadController < ApplicationController

  after_filter  :set_access_control_headers

  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
  end


  def submitNewLead


    phoneNumber=params[:phoneNumber]
    answer=params[:answers]
    isInterested=params[:isInterested]

    if phoneNumber!=nil && answer!=nil && isInterested!=nil

      LeadConvertor.create(:phone_number=>phoneNumber,:answer=>answer,:is_interested=>isInterested)

      render :json=>{:success=>true}.to_json
    else
      render :json=>{:success=>false}.to_json
    end


  end
end