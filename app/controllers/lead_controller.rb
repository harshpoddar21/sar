class LeadController < ApplicationController

  after_filter  :set_access_control_headers

  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
  end


  def submitNewLead


    render :json=>{:success=>true}.to_json

  end
end