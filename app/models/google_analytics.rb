
class GoogleAnalytics

  @@tracker

  def self.tracker

    @@tracker=Staccato.tracker('UA-77497361-3')

    @@tracker

  end

   def self.sendBookingTransaction fromLocationName,routeId,price,bookingId,userId,couponCode


        self.sendHitRequest({"t"=>"transaction",
                             "ti"=> bookingId,
                             "ta"=> 'Booking',
                             "tr"=> price.to_s,
                             "uid"=>userId.to_s,
                             "cid"=>userId.to_s,
                             "tcc"=>couponCode
                         })

# Track transaction item (matching transaction_id and item name REQUIRED)

     self.sendHitRequest({
       t:"item",
       ti:bookingId,
       in:fromLocationName,
       ip:price.to_s,
       uid:userId.to_s,
       cid:userId.to_s,
       iq:1,
       iv:"Booking "+routeId.to_s,
       cu:"INR"
     })
   end


  def self.sendHitRequest params

    params=self.mergeRequiredParams params

    puts params.to_query

    response=RestClient.post "https://www.google-analytics.com/collect",params,{}

    puts response.code
    puts response.body


  end

  def self.sendSubscriptionTransaction routeId,price,subscriptionId,userId,fromLocationName


    self.sendHitRequest({"t"=>"transaction",
                         "ti"=> subscriptionId,
                         "ta"=> 'Subscription',
                         "tr"=> price.to_s,
                         "uid"=>userId.to_s,
                         "cid"=>userId.to_s,
                        })
    self.sendHitRequest({
                            t:"item",
                            ti:subscriptionId,
                            in:fromLocationName,
                            ip:price.to_s,
                            uid:userId.to_s,
                            cid:userId.to_s,
                            iq:1,
                            iv:"Subscription "+routeId.to_s,
                            cu:"INR"

                        })
  end


  def self.mergeRequiredParams params

    reqParams={
        "v"=>1,
        "tid"=>'UA-77497361-3'
    }
    params.merge! reqParams

  end


end