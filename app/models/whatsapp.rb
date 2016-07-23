class Whatsapp < ActiveRecord::Base

  def self.createGroup name


    ConnectionManager.makePostHttpRequest "",""

  end
end
