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

    session["info"][PAYMENT_KEY]=PAYMENT_TRIED
    phoneNumber=session["info"]["phone_number"]
    if (phoneNumber==nil)
      render :text=>"Something bad has happened.Please try again"
    else

      @transaction=Transaction.new
      @transaction.phone_number=phoneNumber
      @transaction.status=0
      @transaction.amount=1
      @transaction.save

    end


  end

  def paymentDone
    checkTool=ChecksumTool.new
    paytmParams=Hash.new
    params["payment"].each do |key,value|
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
       session[PAYMENT_KEY]=PAYMENT_SUCCESS
      else
        transaction.comments=params1.to_json
        transaction.save

        session[PAYMENT_KEY]=PAYMENT_FAILED

      end
    else
      render :text=>"Something bad has happended.Please try again"
    end

    redirect_to :controller=>"suggest",:action =>"index"

  end






end