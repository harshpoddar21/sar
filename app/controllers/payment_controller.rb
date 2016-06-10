class PaymentController < ApplicationController
  PAYMENT_SUCCESS=1
  PAYMENT_FAILED=2
  PAYMENT_TRIED=3
  PAYMENT_KEY="payment_status"
  def paymentError
    render "lazypay-error"
  end

  def newUserPayment

    if session["phoneNumber"]!=nil && session["amount"]!=nil
      render "lazypay-new-user"
    else
      redirect_to action: "paymentError"
    end

  end

  def makePaymentOtpCall

    if (session["phoneNumber"]!=nil && session["amount"]!=nil)

      render "lazypay-otp"
    else
      redirect_to action: "paymentError"
    end


  end

  def paymentSuccess
    render "lazypay-successful"
  end

  def paymentUnsuccessful
    render "lazypay-unsuccessful"

  end

  def setSessionVar
    session[params[:key]]=params[:value]
  end


  def checkUserEligibilityForPayment

    phoneNumber=params[:phoneNumber]
    amount=100

    responseFinal=Hash.new

    response=Lazypay.isUserEligible phoneNumber,amount
    response=JSON.parse response.body


    session["phoneNumber"]=phoneNumber
    session["amount"]=amount

    if response["txnEligibility"]
      if !response["emailRequired"]
        #user can pay via lazypay

        responseFinal["success"]=true
        responseFinal["redirect"]="/payment/initiatePayment"
      else

        if response["code"]=="LP_ELIGIBLE"
          #user is lazy pay user but need to verify email
          responseFinal["success"]=true
          responseFinal["redirect"]="/payment/newUserPayment"
        elsif response["code"]=="SIGNUP_AVAILABLE"
          #user is new user
          responseFinal["success"]=true
          responseFinal["redirect"]="/payment/newUserPayment"
        else

          responseFinal["success"]=true
          responseFinal["redirect"]="/payment/newUserPayment"
        end


      end
    else

      reason=response["reason"]
      code=response["code"]
      responseFinal["success"]=true
      responseFinal["redirect"]="/payment/newUserPayment"
    end

    render :json=>responseFinal.to_json
  end

  def initiatePayment


    if (session["phoneNumber"]==nil || session["amount"]==nil || params[:email_form]==nil)

      redirect_to action: "paymentError"
      return

    end

    email=params[:email_form]
    transaction=Transaction.new
    transaction.phone_number=session[:phoneNumber]
    transaction.email=email
    transaction.status=0
    transaction.amount=100
    transaction.save
    response=Lazypay.initiatePayment(email,session["phoneNumber"],session["amount"],transaction.id,url_for(action:"notifyPayment"),url_for(action:"paymentComplete"))

    response=JSON.parse response.body

    if (response["txnRefNo"]!=nil)
      if (response["paymentModes"][0]=="OTP")
       session["txnRefNo"]=response["txnRefNo"]
       redirect_to action: "makePaymentOtpCall"
      else
       session["txnRefNo"]=response["txnRefNo"]
       redirect_to response["checkoutPageUrl"]
      end
    else
      redirect_to action: "paymentError"
    end

  end

  def notifyPayment

  end

  def paymentComplete

  end


  def makePayment
    session["info"]=JSON.parse params[:info]

    session["info"]["pick"]=Array.new
    session["info"][PAYMENT_KEY]=PAYMENT_TRIED
    phoneNumber=session["info"]["phone_number"]


  #  saveNewSubscription session["info"]

    if (phoneNumber==nil)
      render :text=>"Something bad has happened.Please try again"
    else

      @transaction=Transaction.new
      @transaction.phone_number=phoneNumber
      @transaction.routeid=session["info"]["routeid"]
      @transaction.route_type=session["info"]["route_type"]

      @transaction.status=0
      if session["info"]["route_type"]==Route::SUGGESTED_ROUTE
        priceSel=Price.where(:routeid=>session["info"]["routeid"]).where("pass_type"=>session["info"]["pass_type"]).last
        if priceSel==nil
          throw CustomError::ParamsException,"Invalid amount"
        else
          @transaction.amount=priceSel.price
        end
      else
        if session["info"]["pass_type"]==1
          @transaction.amount=500
        else
          @transaction.amount=4500
        end
      end

      if (phoneNumber=="8800846150" || phoneNumber=="8130737777")
        @transaction.amount=1
      end


      @transaction.save

    end


  end

  def saveNewSubscription data
    customer_number=data["phone_number"]
    from_lat=data["homelat"]
    to_lat=data["officelat"]
    from_lng=data["homelng"]
    to_lng=data["officelng"]
    from_str=data["homeAddress"]
    to_str=data["officeAddress"]
    pushSubStatus=data["pushSubscriptionStatus"]

    subId=data["subscriberID"]
    from_mode=data["commutework"].join(",")
    to_mode=data["commutework"].join(",")
    from_time=data["reachwork"].join(",")
    to_time=data["leavework"].join(",")
    route_type=1
    routeid=0
    if customer_number!=nil && from_lat!=nil && to_lat!=nil && from_lng!=nil  && to_lng!=nil && from_mode!=nil && to_mode!=nil && from_time!=nil && to_time!=nil && from_str!=nil && to_str!=nil

      suggestion=Subscription.new
      suggestion.customer_number=customer_number
      suggestion.from_lat=from_lat
      suggestion.from_lng=from_lng
      suggestion.to_lat=to_lat
      suggestion.to_lng=to_lng
      suggestion.from_str=from_str
      suggestion.from_mode=from_mode
      suggestion.from_time=from_time
      suggestion.to_lat=to_lat
      suggestion.sub_status=pushSubStatus
      suggestion.sub_id=subId
      suggestion.to_lng=to_lng
      suggestion.to_time=to_time
      suggestion.to_str=to_str
      suggestion.to_mode=to_mode
      suggestion.route_type=route_type
      suggestion.routeid=routeid
      suggestion.save

    else

    end

  end

  def paymentDone
    checkTool=ChecksumTool.new
    paytmParams=Hash.new
    params.each do |key,value|
      if key=="controller" || key=="action"
        next
      end
      paytmParams[key]=value
    end
    params1=checkTool.get_checksum_verified_array paytmParams


    if params1["IS_CHECKSUM_VALID"]=="Y"
      order_id=params1["ORDERID"]
      if /_/=~order_id
        order_id=order_id.split "_"
        order_id=order_id[1]
        logger.info "order id is "+order_id.to_s
      end
      transaction=Transaction.find_by(:id=>order_id)
      if params1["STATUS"]=="TXN_SUCCESS"
       transaction.status=1
       transaction.save
       if session["info"]!=nil
       session["info"][PAYMENT_KEY]=PAYMENT_SUCCESS
       end

      else
        transaction.comments=params1.to_json
        transaction.save
        if session["info"]!=nil
        session["info"][PAYMENT_KEY]=PAYMENT_FAILED
        end
       TelephonyManager.sendSms transaction.phone_number ,"Hey Shuttlr! We have received your payment of Rs #{transaction.amount}. We will contact you when the route is live. Your money will be refunded in case the route is not live in 30 days."
      end
    else
      render :text=>"Something bad has happended.Please try again"
    end

    redirect_to :controller=>"suggest",:action =>"index"

  end






end