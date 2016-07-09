class RouteSuggestionCombined < ActiveRecord::Base


  self.table_name = "Route_Suggestion_Combined"

  def created_at

    self[:DATE_CREATED]

  end

  def phone_number

    self[:PHONE_NUMBER]

  end

  def from_str

    self[:HOME_PICKUP]
  end

  def to_str

    self[:OFFICE_DROP]

  end

  def customer_number
    self[:PHONE_NUMBER]
  end

  def channel

    self[:DATA_BASE]=="Harsh" ? "MYOR" : "app/shuttl"

  end

end