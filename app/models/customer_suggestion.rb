class CustomerSuggestion < ActiveRecord::Base


  def phone_number
    customer_number
  end

  def from_str

    from_time

  end

  def to_str

    to_time


  end

end
