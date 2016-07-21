require 'open-uri'
class WhatsappController < ApplicationController
  def analyzeWhatsApp

      doc = Nokogiri::HTML(open("https://myor.shuttl.com/show/vaishali"))
      messages=doc.xpath("//div[@class=msg")
      currentTime=0
      currentAuthor=nil
      messages.each do |m|

        if m.xpath("//*[contains(@class,'message-system')]")

        end

      end
  end


  def insertData


  end
end