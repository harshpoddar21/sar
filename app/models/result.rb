class Result

  attr_accessor :data,:success,:message


  def initialize success=nil,data=nil,message=nil

    self.success =success
    self.message =message
    self.data=data

  end

  def to_json

    {"success"=>self.success,"data"=>self.data,"message"=>self.message}.to_json

  end

end