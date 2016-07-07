class Referral

  def self.referUser referralCode,phone_number

    if referralCode!=nil && phone_number!=nil
      exist=PosterReferral.find_by(:phone_number => phone_number)
      if exist==nil
        referee=ReferralCode.find_by(:code=>referralCode)
        if referee!=nil && referee.phone_number!=phone_number
          PosterReferral.create(:code => referralCode, :phone_number => phone_number)
          return true
        else
          return false,Referral::ErrorCode::INVALID_REFERRAL_CODE
        end
      else

        return false,Referral::ErrorCode::USER_ALREADY_REFERRED

      end

    else
      raise CustomError::InvalidInput,"Invalid Input"
    end
  end


  def self.createReferralCodeForUser phoneNumber

    if ReferralCode.find_by(:phone_number=>phoneNumber)==nil

      iteration=0
      while iteration<100
        number=rand(100...999)
        if ReferralCode.find_by(:code => number)==nil

          ReferralCode.create(:code=>number,:phone_number=>phoneNumber)
          return true,number
        end
        iteration=iteration+1
      end

      return false,-1
    else
      return true,ReferralCode.find_by(:phone_number=>phoneNumber).code
    end

  end


  def self.getReferralCodeForUser phoneNumber

    if ReferralCode.find_by(:phone_number=>phoneNumber)==nil


      return false,nil

    else
      return true,ReferralCode.find_by(:phone_number=>phoneNumber).code
    end
  end

  class ErrorCode
    USER_ALREADY_REFERRED=1
    INVALID_REFERRAL_CODE=2
  end

end