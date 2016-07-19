class Session

  MORNING_SESSION=1
  EVENING_SESSION=2
  THRESHOLD_FOR_MORNING_SESSION=7*Constants::SECONDS_IN_HOUR
  def self.getCurrentSessionType
    if Time.now.to_i%Constants::SECONDS_IN_DAY > THRESHOLD_FOR_MORNING_SESSION
      return EVENING_SESSION
    else
      return MORNING_SESSION
    end
  end

  def self.getMorningSessionEndUnixTime

    return (Utils.getTodayMorningUnixTime + THRESHOLD_FOR_MORNING_SESSION + 5*Constants::SECONDS_IN_HOUR+30*Constants::SECONDS_IN_MINS)

  end
end