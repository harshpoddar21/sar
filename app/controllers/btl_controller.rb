class BtlController < ApplicationController

  def updatePromoterList

    if params["data"]!=nil

      params["data"].each do |val|
        channel=LBtlChannel.find_by_channel_id val["phone_number"]
        if channel==nil
          LBtlChannel.create(:channel_id=>val["phone_number"],:name=>val["name"])
        else
          channel.name=params[:name]
        end

      end

    else
      raise CustomError::ParamsException,"Invalid Params"
    end


    render :text=>"OK"

  end





end