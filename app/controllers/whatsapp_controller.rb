class WhatsappController < ApplicationController
  def analyzeWhatsApp


    location=params[:location]
    data=WhatsAppData.find_by(:location=>location)
    if data!=nil && data.data!=nil && data.data!=""
      doc = Nokogiri::HTML(data.data)
      doc.xpath("")
    else
      render :text=>"No data found in DB"
    end



  end
end