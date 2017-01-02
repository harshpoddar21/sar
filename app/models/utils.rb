class Utils


  def self.getTodayMorningUnixTime morningHour=nil

    currentTime=Time.now.to_i
    morningTime=(currentTime/Constants::SECONDS_IN_DAY)*Constants::SECONDS_IN_DAY-5*Constants::SECONDS_IN_HOUR-30*Constants::SECONDS_IN_MINS


  end

  def hexToDecimal number

    number.to_i(16).to_s(10)

  end

  def decToHex number

    number.to_i(10).to_s(16)

  end


  def self.generateBase64 *args

    Base64.urlsafe_encode64(args.join("|"))

  end


  def self.decodeBase64Generated encodedValue

    Base64.urlsafe_decode64(encodedValue).split("|")

  end

end