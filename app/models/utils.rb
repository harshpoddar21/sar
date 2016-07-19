class Utils


  def self.getTodayMorningUnixTime morningHour=nil

    currentTime=Time.now.to_i
    morningTime=(currentTime/Constants::SECONDS_IN_DAY)*Constants::SECONDS_IN_DAY-5*Constants::SECONDS_IN_HOUR-30*Constants::SECONDS_IN_MINS

  end



end