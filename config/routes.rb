Rails.application.routes.draw do
  get 'suggest/showRouteFoundFromSlots'

  get 's/:id' => "shortener#index" , as:"shorten"

  get 's/:id/:sign' => "shortener#linkClicked"
  get 'b/:id/:sign' => "shortener#linkClickedBooking"


  get 'campaign/unsubscribeUser'
  get 'campaign/sendFollowUpToUnsubscriber'



  get 'welcomeNewRes' =>"ambassador#landing"

  get 'lead/submitNewLead'
  post 'lead/submitNewLead'
  get 'book_shuttl'=>'referral#book_shuttl'
  get "referral/submitBooking"

  get 'referral/showRef'
  get 'suggest/bTb'
  get 'service/tracking' => 'service#tracking'
  post 'service/tracking' => 'service#tracking'
  get 'service/getDriverInfo'
  get 'service/getPickUpPointsForRoute'
  get 'service/refreshEtaForDiffPoints'
  get 'service/refreshPositionForDiffPoints'

  get 'suggest/getSuggestionViaTab'
  post 'suggest/saveNewSuggestionTab'
  get 'suggest/messageReceived'
  get 'suggest/new_lead'
  get 'suggest/zoneCovered' =>"suggest#zoneCovered"
  get 'suggest/sendSms'
  match 'suggest/images/:image' , to: "suggest#loadImage",via:[:get]
  get 'suggest/getSlots'
  get 'suggest/getFromTo'
  get 'suggest/getPath'
  get 'suggest/generateWhatsAppShareLinkForUser'
  get 'suggest/getSlotsWithCoords'
  get 'suggest/sendOtp'
  get 'suggest/verifyOtp'
  get 'suggest/logPromoterIn'

  get 'referral/index'


  get 'whatsapp/insertData' => 'whatsapp#insertData'

  get 'restricted/getRoutePoints'
  get 'whatsapp/analyzeWhatsApp' =>'whatsapp#analyzeWhatsApp'
  get 'whatsapp/refer'

  get 'referral/makeTrialReqForUser'
  get 'customercare/update_lead_data'
  post 'customercare/update_lead_data'
  get 'customercare/sendSMS'
  post 'customercare/sendSMS'
  get 'customercare/getData'
  post 'customercare/getData'
  get 'customercare/getBookingDetails'
  post 'customercare/getBookingDetails'
  get 'customercare/updateKeyValueForBooking'
  post 'customercare/updateKeyValueForBooking'
  get 'customercare/sendSmsForBooking'
  post 'customercare/sendSmsForBooking'

  get 'restricted/leadFeedbackReceived'
  get 'restricted/getDetailsForLead'
  get 'restricted/feedbackReceived'
  get 'restricted/boardingRequestReceived'
  get 'restricted/responseReceived'
  get 'restricted/makeEveningIvrCall'
  get 'restricted/getEveningTime'
  get 'restricted/getDecryptedUserId'


  get 'route/submitRouteMapping'

  post 'route/submitRouteMapping'


  get 'restricted/autoBookingReceived'


  get 'boarding/sendBoardingIVRRequest'

  get 'suggest/eveningTime' => "restricted#eveningTime"


  get 'show/laxminagar' => "shortener#laxminagar"
  get 'show/gazipur' => "shortener#gazipur"
  get 'show/preetvihar' => "shortener#preetvihar"
  get 'show/vaishali' => "shortener#vaishali"


  get 'nps/submitNps'
  root 'suggest#base'
get 'payment/paymentDone'


  get 'boarding/submitBoardingMessage'
  post 'boarding/submitBoardingMessage'

  get 'route/submitPickUpPointClusterMapping'
  post 'route/submitPickUpPointClusterMapping'

  get 'route/submitLeadRoutes'
  post 'route/submitLeadRoutes'

  get 'lcustomer/getDate' => "lcustomer#getData"
  get 'lcustomer/updateLeadData' =>"lcustomer#updateLeadData"

  post 'lcustomer/getDate' => "lcustomer#getData"
  post 'lcustomer/updateLeadData' =>"lcustomer#updateLeadData"

  get 'payment/makePayment'
  post 'payment/makePayment'
post 'suggest/createRoute'
  get 'suggest/getInfo'
  post 'payment/paymentDone'
  get 'payment/setSessionVar'

  get 'suggest/getLink'
  post 'suggest/saveNewSuggestion' =>"suggest#saveNewSuggestion"

  get 'suggest/getWhatsAppShareLink'

get 'suggest/index_orca'
  get 'suggest/verifyPhoneCall'
  get 'suggest/makePhoneCall'
  post 'suggest/makePhoneCall'
  post 'suggest/verifyPhoneCall'

  get 'boarding/unsubscribe'

  get 'boarding/assistBoarding'

  get 'boarding/getBoardingDetails'
  post 'boarding/submitBoarding'

  get 'btl/updatePromoterList'
  post 'btl/updatePromoterList'

  get 'referral/showReferral'
  get 'suggest/confirmUser'
  get 'suggest/index'
  get 'suggest/insertLiveRoutes' =>"suggest#insertLiveRoutes"
  get 'suggest/redirectToPlayStore'
  get 'suggest/redirectToPlayStoreP'

  get 'payment/initiatePayment'
  post 'payment/initiatePayment'
  get 'suggest/refreshRouteCache'

  get 'delhidata/theonewithall'

  get 'payment/notifyPayment'
  get 'payment/paymentComplete'

  get 'payment/checkUserEligibilityForPayment'

  get 'suggest/mapview'
  get 'payment/paymentError'
  get 'payment/paymentSuccess'
  get 'payment/makePaymentOtpCall'
  get 'payment/newUserPayment'
  get 'payment/paymentUnsuccessful'

  get 'poster/generate' => "poster#generateNewPoster"


  get 'restricted/ptCustomerResponse'
  get 'restricted/sendIVRCall'

  get 'randomshit/getOfficeLocations'
  get 'randomshit/extractDelhiDtc'

  get 'pass/showPass'

  get 'random/call' =>"randomshit#call"

get 'affiliate/registerAffiliate'

  get 'affiliate/submitEntry'

  get "delhidata/getDelhiWardData"
get 'delhidata/referralVis'
  get 'delhidata/delhiPopulationDist'
  get 'delhidata/abc'

  get 'shuttl/getRoutePointsGeoJsonByRoutes' => 'geo_json#getRoutePointsGeoJsonByRoutes'
  get 'shuttl/getStopsGeoJsonByRoutes' => 'geo_json#getStopsGeoJsonByRoutes'

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
