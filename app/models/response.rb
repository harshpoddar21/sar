class Response

  @data
  @success

  def initialize success,data=nil

    @success=success
    if success
      @data=data
    else
      @data=Hash.new
    end

  end

  def to_json
    {"success"=>@success,"data"=>@data}
  end

end