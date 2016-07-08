class UrlShortener < ActiveRecord::Base



  def getPositiveLinkShortened


    "https://myor.shuttl.com/s/"+self.id.to_s+"/1"


  end


  def getNegativeLinkShortened


    "https://myor.shuttl.com/s/"+self.id.to_s+"/2"

  end

  def negativeLinkClicked

    new_lead=NewLead.find_by(:id=>self.new_lead_id)
    if new_lead==nil
      raise Exception,"Something bad has happened"
    end
    new_lead.count_clicked_on_negative=new_lead.count_clicked_on_negative==nil ? 1 : new_lead.count_clicked_on_negative+1
    new_lead.save

  end


  def positiveLinkClicked

    new_lead=NewLead.find_by(:id=>self.new_lead_id)
    if new_lead==nil
      raise Exception,"Something bad has happened"
    end
    new_lead.count_clicked_on_positive=new_lead.count_clicked_on_positive==nil ? 1 : new_lead.count_clicked_on_positive+1
    new_lead.save

  end





end
