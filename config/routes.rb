Rails.application.routes.draw do
  get 'suggest/showRouteFoundFromSlots'

  get 'suggest/zoneCovered' =>"suggest#zoneCovered"
  get 'nps/submitNps'
  root 'suggest#base'
get 'payment/paymentDone'
  get 'payment/makePayment'
  post 'payment/makePayment'
post 'suggest/createRoute'
  get 'suggest/getInfo'
  post 'payment/paymentDone'
  get 'suggest/getSlots'
  get 'suggest/getFromTo'
  get 'suggest/getPath'

  get 'suggest/generateWhatsAppShareLinkForUser'
  get 'suggest/getSlotsWithCoords'
  get 'suggest/sendOtp'
  get 'suggest/verifyOtp'
  get 'payment/setSessionVar'

  get 'suggest/getLink'
  post 'suggest/saveNewSuggestion' =>"suggest#saveNewSuggestion"

  get 'suggest/getWhatsAppShareLink'

get 'suggest/index_orca'
  get 'suggest/verifyPhoneCall'
  get 'suggest/makePhoneCall'
  post 'suggest/makePhoneCall'
  post 'suggest/verifyPhoneCall'

  get 'suggest/confirmUser'
  get 'suggest/index'
  get 'suggest/insertLiveRoutes' =>"suggest#insertLiveRoutes"
  get 'suggest/redirectToPlayStore'

  get 'payment/initiatePayment'
  post 'payment/initiatePayment'
  get 'suggest/refreshRouteCache'


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
