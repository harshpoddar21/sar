require 'open-uri'
class WhatsappController < ApplicationController
  def analyzeWhatsApp

    location=params[:location]

      doc = Nokogiri::HTML(open("https://myor.shuttl.com/show/"+location))
      messages=doc.xpath("//div[@class='message-list']//div[contains(@class,'msg')]")
      currentTime=0
      currentAuthor=nil
      groupCreater=nil


      userDetails=Hash.new

      systemEventOccurred=Hash.new

      currentAuthor="unknown"
      messages.select do |m|

        if m.xpath(".//*[contains(@class,'message-system')]").length>0
          systemMessage=m.xpath(".//span[contains(@class,'emojitext')]").first
          systemMessage=systemMessage.text
          if (systemMessage=~/\d+\/\d+\/\d+/) != nil
            date=systemMessage.split("/")
            currentTime= Date.new(date[2].to_i,date[0].to_i,date[1].to_i).to_time.to_i
            flushEventQueue(systemEventOccurred,currentTime)
            systemEventOccurred=Hash.new

          elsif (systemMessage=~/created/) != nil


            owner=systemMessage.split("created")
            groupCreater=owner[0].strip
          elsif (systemMessage=~/added/) !=nil

            newNumber=systemMessage.split("added")
            newNumber=newNumber[1].strip
            event=UserEvent.new
            event.phoneNumber=newNumber
            event.addedTimeBestEstimate=currentTime
            userDetails[newNumber]=event
            systemEventOccurred[newNumber]=event
          elsif (systemMessage=~/left/) !=nil

            newNumber=systemMessage.split("left")
            newNumber=newNumber[0].strip

            logger.info "newNumber"+newNumber
            event=nil
            if userDetails[newNumber]!=nil
              event=userDetails[newNumber]
            else
              event=UserEvent.new
              event.phoneNumber=newNumber
              userDetails[newNumber]=event
            end
            systemEventOccurred[newNumber]=event
            event.leftTimeBestEstimate=currentTime
          elsif (systemMessage=~/removed/) !=nil
             newNumber=systemMessage.split("removed")
             newNumber=newNumber[1].strip

             if userDetails[newNumber]!=nil
               event=userDetails[newNumber]
             else
               event=UserEvent.new
               event.phoneNumber=newNumber
               userDetails[newNumber]=event
               systemEventOccurred[newNumber]=event
             end
             event.leftTimeBestEstimate=currentTime
          elsif (systemMessage=~/admin/) !=nil
            next
          else
            logger.info "Unkown system event"
          end
        elsif m.xpath(".//*[contains(@class,'message-chat')]").length>0
          if m.xpath(".//*[contains(@class,'message-author')]").length>0
            author=m.xpath(".//*[contains(@class,'message-author')]").first.xpath(".//span[contains(@class,'emojitext')]")
            author=author.text.strip
            currentAuthor=author
          else
            author=currentAuthor
          end
          if userDetails[currentAuthor]!=nil
            event=userDetails[currentAuthor]
          else
            event=UserEvent.new
            event.phoneNumber=currentAuthor
          end
          timeStr=m.xpath(".//*[contains(@class,'message-datetime')]").text
          hour=0
          mins=0
          if (timeStr=~ /AM/)!=nil
            timeA=(timeStr.split("AM"))[0].split(":")
            hour=timeA[0].to_i
            mins=timeA[1].to_i
          else
            timeA=(timeStr.split("PM"))[0].split(":")
            hour=timeA[0].to_i+12
            mins=timeA[1].to_i
          end
          currentTime=(currentTime/86400)*86400+(hour-5)*3600+(mins-30)*60

          event.addConversation(m.xpath(".//*[contains(@class,'emojitext')]").text,currentTime)
          flushEventQueue(systemEventOccurred,currentTime)
          systemEventOccurred=Hash.new
        elsif m.xpath(".//*[contains(@class,'message-image')]").length>0
          if m.xpath(".//*[contains(@class,'message-author')]").length>0
            author=m.xpath(".//*[contains(@class,'message-author')]").first.xpath(".//span[contains(@class,'emojitext')]")
            author=author.text.strip
            currentAuthor=author
          else
            author=currentAuthor
          end
          if userDetails[currentAuthor]!=nil
            event=userDetails[currentAuthor]
          else
            event=UserEvent.new
            event.phoneNumber=currentAuthor
          end
          timeStr=m.xpath(".//*[contains(@class,'message-datetime')]").text
          hour=0
          mins=0
          if (timeStr=~ /AM/)!=nil
            timeA=(timeStr.split("AM"))[0].split(":")
            hour=timeA[0].to_i
            mins=timeA[1].to_i
          else
            timeA=(timeStr.split("PM"))[0].split(":")
            hour=timeA[0].to_i+12
            mins=timeA[1].to_i
          end
          currentTime=(currentTime/86400)*86400+(hour-5)*3600+(mins-30)*60

          event.addConversation("Image sent by user",currentTime)
          flushEventQueue(systemEventOccurred,currentTime)
          systemEventOccurred=Hash.new

        elsif  m.xpath(".//*[contains(@class,'message-vcard')]").length>0
          next
        else
          logger.info "Unrecognized type"

        end

      end


    render :json => userDetails.to_json

  end


  def insertData


  end

  class UserEvent
    attr_accessor :phoneNumber,:addedTimeBestEstimate,
                  :addedTimeWorstEstimate,:leftTimeBestEstimate,
                  :leftTimeWorstEstimate,:conversations

    class Conversation
      attr_accessor :text,:time
    end
    def addConversation message,time

      conversation=Conversation.new
      conversation.time =time
      conversation.text=message

      if self.conversations==nil
        self.conversations=Array.new
      end
      self.conversations.push conversation
    end

  end

  def flushEventQueue(systemEventOccurred,currentTime)
    systemEventOccurred.each do |key,event|

      if event.addedTimeWorstEstimate==nil && event.addedTimeBestEstimate!=nil
        event.addedTimeWorstEstimate=currentTime
      elsif event.leftTimeWorstEstimate==nil && event.leftTimeBestEstimate!=nil
        event.leftTimeWorstEstimate=currentTime
      else
        raise Exception,"Why i am not able to assign anything?"
      end
    end
  end



  def createWhatsAppGroup


    name=params[:groupname]


  end

  def refer

    @referralCode=params[:rc]

    if ! (Referral.isValidReferralCode? @referralCode)

      render :text=>"Sorry the referral code is invalid"
    end
    @referralLink=Referral::Channel::WhatsApp.getWhatsAppReferralLinkForFriendsForReferralCode @referralCode
  end

end