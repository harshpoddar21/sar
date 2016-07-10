class ShortenerController < ApplicationController


  def index

  end

  def linkClicked
    @redirectUrl="https://myor.shuttl.com"
    urlSh=UrlShortener.find_by(:id=>params[:id])
    if urlSh==nil
    else
      if params[:sign]==1.to_s
        @redirectUrl=urlSh.p_link
        urlSh.positiveLinkClicked
      elsif params[:sign]==2.to_s
        @redirectUrl=urlSh.n_link
        urlSh.negativeLinkClicked
      else

      end
    end
  end


  def laxminagar

  end
  def preetvihar

  end
  def vaishali

  end
  def gazipur

  end

end