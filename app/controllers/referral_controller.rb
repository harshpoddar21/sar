class ReferralController < ApplicationController


  def index

    @referralCode=params[:rc]!=nil ? params[:rc]:0

  end

  def makeTrialReqForUser

    referralCode=params[:referral_code]
    phoneNumber=params[:phone_number]

    if !Referral.isValidReferralCode? referralCode || phoneNumber==nil
      if phoneNumber!=nil
        TelephonyManager.sendSms phoneNumber,"Your referral link is invalid."
      end
    else
      referre=Referral.getPhoneNumberForReferralCode referralCode
      if referre!=nil

        if referre!=phoneNumber
          if ReferralLead.find_by(:phone_number=>phoneNumber)!=nil
            TelephonyManager.sendSms phoneNumber,"We are excited that you have decided to try Shuttl for your office commute. Please download the shuttl app (http://bit.ly/downloadShuttl) and use coupon code NXR50 to get 50% off on your first ride."
          else
            ReferralLead.create(:phone_number=>phoneNumber,:referral_code=>referralCode)

            TelephonyManager.sendSms phoneNumber,"We are excited that you have decided to try Shuttl for your office commute. Please download the shuttl app (http://bit.ly/downloadShuttl) and use coupon code NXR50 to get 50% off on your first ride."
            TelephonyManager.sendSms referre,"We thought that you would like to know that your referral has decided to try Shuttl. Your account will be credited with 5 free rides on every subscription bought."
          end

        else

          TelephonyManager.sendSms phoneNumber,"Referral Link is invalid"

        end


      else
        logger.info "Some bug in maketrial"

      end


    end
    referralCodeUser=Referral.getPhoneNumberForReferralCode phoneNumber
    if referralCodeUser==nil

      success,referralCodeUser=Referral.createReferralCodeForUser phoneNumber
      if referralCodeUser==nil
        referralCodeUser=-1
      end

    end
    response=Hash.new
    response["success"]=true
    response["referral_link"]=BitlyUtils.shortenUrl "http://myor.shuttl.com/referral/index?rc="+referralCodeUser.to_s

    render :json=>response.to_json

  end



  def showReferral

  end

  def showRef

  end


  def book_shuttl

  end

  def submitBooking

    origin=params[:origin]
    destination=params[:destination]
    phoneNumber=params[:phoneNumber]

    if origin!=nil && destination!=nil && phoneNumber!=nil

      booking=BookingReferral.create(:phone_number=>phoneNumber,:destination=>destination,:origin=>origin)
      TelephonyManager.sendSms phoneNumber,"Ahoy! Your booking id is #{123543+booking.id}. A Shuttl executive will call you shortly to help you board Shuttl."
    else
      raise CustomError::ParamsException,"Invalid Booking"
    end

    render :text=>'OK'
  end



end