/**
 * Created by Rahul - Shuttl on 7/5/2016.
 */

var CTA={
    
    "TRYNBUY":1,
    "PAYMENT":2
};
var pickupPoints = [['Kaushambi Metro ', 'Opposite McDonalds'], ['Gazipur & Anand Vihar', 'Gazipur Depot Bus Stand'],
    ['I.P. Extention', 'Hassanpur Depot Entry'], ['Preetvihar Metro ', 'Gate No. 4, Opp. PNB'],
    ['Nirmanvihar Metro ', 'Gate No. 4, Opp. Liberty'], ['Laxminagar Metro ', 'Gate No. 4, Bus Stand'], ['Udyog Vihar ', 'Shankar Chowk'],
    ['Cybercity', 'Indus Ind Metro '], ['Golf Course Road ', 'Sikandarpur Metro']];

var morningTiming = [['07:00', '07:05', '07:10', '07:15', '07:18', '07:21', '08:05', '08:10', '08:15'], ['07:20', '07:25', '07:30', '07:35', '07:38', '07:41','08:50' ,'08:55', '09:00'],
    ['07:55', '08:00', '08:05', '08:10', '08:13', '08:16','09:35' ,'09:40' ,'09:45'], ['08:25', '08:30', '08:35', '08:40', '08:43', '08:46', '10:20', '10:25' ,'10:30']];

var eveningTiming = [['17:25', '17:30', '18:35', '18:40', '18:45', '18:50', '18:55', '19:00'],
    ['18:25', '18:30', '19:45', '19:50', '19:55', '20:00', '20:10', '20:15'],
    ['18:55', '19:00', '20:05', '20:10', '20:15', '20:20', '20:25', '20:30'],
    ['19:25', '19:30', '20:35', '20:40', '20:45', '20:50', '20:55', '21:00']];

var info = {};

var selectedMorningRoute = 1;
var selectedEveningRoute = 1;

function populateRoute(morningRoute, eveningRoute) {
    // js arrays start with index 0
    morningRouteNumber = morningRoute - 1;
    eveningRouteNumber = eveningRoute - 1;


    var html = '';
    html += '<div class="grey-overlay-screen"></div>';
    html += '<div class="payment-successful-container"> <i class="fa fa-times fa-2x cross-icon"></i>';
    html += '<div class="payment-successful-message">Payment successful</div> </div>';
    html += '<div class="try-n-buy-container"> <i class="fa fa-times fa-2x cross-icon"></i>';
    html += '<div class="try-n-buy-message">We\'ve applied a 50% discount coupon on your number. <br> Use it to try our services before you pay for a pass. <br><br>';
    html += ' For more info please contact: 9015122792</div> </div>';
    for (var i = 0; i < pickupPoints.length; i++) {
        html += '<div class="timing odd-row">';
        html += '<div class="location left-location col-xs-5 col-sm-5">';
        html += '</div>';
        html += '<div class="separator-timings">';

        html += '<div class="down-arrow col-xs-1 col-sm-1"><div class="time-value left-time-value ' + ((i==0)? ' left-time-value-first': ((i==pickupPoints.length-1)? ' left-time-value-last': '')) +'">' + morningTiming[morningRouteNumber][i] + '</div></div>';
        html += '<div class="up-arrow col-xs-1 col-sm-1"><div class="time-value right-time-value ' + ((i==0)? ' right-time-value-first': ((i==pickupPoints.length-1)? ' hidden': '')) +'">' + eveningTiming[eveningRouteNumber][pickupPoints.length-i-2] + '</div></div>';

        html += '</div>';
        html += '<div class="location right-location col-xs-5 col-sm-5">';
        html += '<div class="location-heading">' + pickupPoints[i][0] + '</div>';
        html += '<div class="location-description">' + pickupPoints[i][1] + '</div>';
        html += '</div>';
        html += '</div>';
        i++;
        if (i !== pickupPoints.length) {
            html += '<div class="timing even-row">';
            html += '<div class="location left-location col-xs-5 col-sm-5">';
            html += '<div class="location-heading">' + pickupPoints[i][0] + '</div>';
            html += '<div class="location-description">' + pickupPoints[i][1] + '</div>';
            html += '</div>';
            html += '<div class="separator-timings">';
            html += '<div class="down-arrow col-xs-1 col-sm-1"><div class="time-value left-time-value ' + ((i==pickupPoints.length-1)? ' left-time-value-last': '') +'">' + morningTiming[morningRouteNumber][i] + '</div></div>';
            html += '<div class="up-arrow col-xs-1 col-sm-1"><div class="time-value right-time-value ' + ((i==pickupPoints.length-1)? ' right-time-value-last': ((i==pickupPoints.length-2)? ' right-time-value-last': '')) +'">' + eveningTiming[eveningRouteNumber][pickupPoints.length-i-2] + '</div></div>';
            html += '</div>';
            html += '<div class="location right-location col-xs-5 col-sm-5">';

            html += '</div>';
            html += '</div>';
        }
    }

    html += '<div class="slots-container row">';
    html += '<div class="slot morning-slot col-xs-6 col-sm-6" onclick="showMorningSlotList()">';
    html += '<div class="slot-heading">Morning Slot ' + (morningRouteNumber + 1) + ' <i class="fa fa-caret-square-o-down dropdown-button"></i></div>';
    html += '<div class="slot-timing">';
    html += '<span id="morning-start-time" class="slot-time-value">' + morningTiming[morningRouteNumber][0] + '</span>';
    html += '<span class="slot-time-separator"></span>';
    html += '<span id="morning-end-time" class="slot-time-value">' + morningTiming[morningRouteNumber][pickupPoints.length - 1] + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="slot evening-slot col-xs-6 col-sm-6" onclick="showEveningSlotList()">';
    html += '<div class="slot-heading">Evening Slot ' + (eveningRouteNumber + 1) + '<i class="fa fa-caret-square-o-down dropdown-button"></i></div>';
    html += '<div class="slot-timing">';
    html += '<span id="evening-start-time" class="slot-time-value">' + eveningTiming[eveningRouteNumber][0] + '</span>';
    html += '<span class="slot-time-separator"></span>';
    html += '<span id="evening-end-time" class="slot-time-value">' + eveningTiming[eveningRouteNumber][pickupPoints.length - 2] + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    selectedMorningRoute = morningRoute;
    selectedEveningRoute = eveningRoute;
    document.getElementById("main-content-container").innerHTML = html;
}


function routeSelected (morningRoute, eveningRoute) {
    document.getElementById("greyScreen").style.display = "none";
    document.getElementById("morningSlotList").style.display = "none";
    document.getElementById("eveningSlotList").style.display = "none";
    populateRoute(morningRoute, eveningRoute);
}

function showMorningSlotList(){
    document.getElementById("morningSlotList").style.display = "block";
    document.getElementById("greyScreen").style.display = "block";
}

function showEveningSlotList() {
    document.getElementById("eveningSlotList").style.display = "block";
    document.getElementById("greyScreen").style.display = "block";
}

function paymentSuccessful() {

    //payment successful overlay
    $(".grey-overlay-screen, .payment-successful-container, .payment-successful-message").show();
    $(".grey-overlay-screen, .payment-successful-container, .payment-successful-message").on("click", function () {
        $(".grey-overlay-screen, .payment-successful-container, .payment-successful-message").hide();
    });


    // show promotion banner
    $(".info-container").html('<div class="promotion-banner"></div>');
    $('.main-content-container').css("padding-bottom", "0px");

    //hide buttons from the previous page
    $(".fa-caret-square-o-down, .select-pass-title").css("visibility", "hidden");
    $('.morning-slot, .evening-slot').prop('onclick', null).off('click');

    //whatsapp button
    document.getElementById("btn-paytm").innerHTML = "<div class=\"centerVertical\"> Share Via WhatsApp </div>";
    $("#btn-paytm").css({"background": "green", "color": "white"});
    var link = window.location.href;
    $('#btn-paytm').wrap("<a href=\"whatsapp://send?text=Click the link to travel to work with Shuttl " + link + " \" data-action=\"share/whatsapp/share\"></a>");

    //tracking button
    document.getElementById("btn-try-n-buy").innerHTML = "<div class=\"centerVertical\"> Track your Shuttl </div>";
    // $('#btn-make-new-route').wrap("<a href=\"linkToTrackShuttlPage\"></a>");
    var pageOpened;

    $("#btn-try-n-buy").on('click', function () {

        /*TODO
         *
         * Link to tracking page
         *
         * */

        if ('serviceWorker' in navigator) {
            console.log('Service Worker is supported');

            try {
                navigator.serviceWorker.register('sw.js').then(function () {
                    return navigator.serviceWorker.ready;
                }).then(function (serviceWorkerRegistration) {
                    reg = serviceWorkerRegistration;
                    console.log('Service Worker is ready :^)', reg);
                    reg.pushManager.subscribe({userVisibleOnly: true}).then(function (pushSubscription) {
                        sub = pushSubscription;
                        console.log('Subscribed! Endpoint:', sub.endpoint);
                        var subscriberID = sub.endpoint;
                    });
                }).catch(function (error) {
                    console.log('Service Worker Error :^(', error);

                });
            } catch (error) {

            }
        }
        if (!pageOpened) {
            setTimeout(function () {
                window.location.href = 'page.html'
            }, 3000);
            pageOpened = true;
        }
    });
}

function tryNbuy(referral_link) {

    /*
     * OTP call goes here
     * */

    //try-n-buy overlay
    jQuery("#btn-paytm").show();
    jQuery("#btn-paytm")[0].onclick=null;
    jQuery("#btn-try-n-buy")[0].onclick=null;

    jQuery("#btn-try-n-buy").click(function(){

        window.location.href="/service/tracking";
    });

    jQuery("#whatsapp_share").attr('href',"whatsapp://send?text=Click the link to travel to work  "+referral_link);
    jQuery("#btn-try-n-buy").css("width","50%");
    $(".grey-overlay-screen, .try-n-buy-container, .try-n-buy-message").show();
    $(".grey-overlay-screen, .try-n-buy-container, .try-n-buy-message").on("click", function () {
        $(".grey-overlay-screen, .try-n-buy-container, .try-n-buy-message").hide();
    });

        //hide buttons from the previous page
        $(".fa-caret-square-o-down, .select-pass-title").css("visibility", "hidden");
        $('.morning-slot, .evening-slot').prop('onclick', null).off('click');

        // show promotion banner
        $(".info-container").html('<div class="promotion-banner"></div>');
        $('.main-content-container').css("padding-bottom", "0px");

        //whatsapp button
        document.getElementById("btn-paytm").innerHTML = "<div class=\"centerVertical\"> Refer Via WhatsApp </div>";
        $("#btn-paytm").css({"background": "green", "color": "white"});
        var link = window.location.href;
        $('#btn-paytm').wrap("<a id='whatsapp_share' href=\"whatsapp://send?text=Click the link to travel to work with Shuttl " + link + " \" data-action=\"share/whatsapp/share\"></a>");

        //tracking button
        document.getElementById("btn-try-n-buy").innerHTML = "<div class=\"centerVertical\"> Track your Shuttl </div>";
        // $('#btn-make-new-route').wrap("<a href=\"linkToTrackShuttlPage\"></a>");
        var pageOpened;

        $("#btn-try-n-buy").on('click', function () {

            /*TODO
             *
             * Link to tracking page
             *
             * */

            if ('serviceWorker' in navigator) {
                console.log('Service Worker is supported');

                try {
                    navigator.serviceWorker.register('sw.js').then(function () {
                        return navigator.serviceWorker.ready;
                    }).then(function (serviceWorkerRegistration) {
                        reg = serviceWorkerRegistration;
                        console.log('Service Worker is ready :^)', reg);
                        reg.pushManager.subscribe({userVisibleOnly: true}).then(function (pushSubscription) {
                            sub = pushSubscription;
                            console.log('Subscribed! Endpoint:', sub.endpoint);
                            var subscriberID = sub.endpoint;
                        });
                    }).catch(function (error) {
                        console.log('Service Worker Error :^(', error);

                    });
                } catch (error) {

                }
            }
            if (!pageOpened) {
                setTimeout(function () {
                    window.location.href = 'page.html'
                }, 3000);
                pageOpened = true;
            }
        });
    }




// otp helper functions

function otpentered(obj) {
    if (/\d{4,4}/.test(jQuery(obj).val())) {
        var otp = jQuery(obj).val();

        jQuery.ajax({url: "/suggest/verifyOtp?otp=" + otp + "&phoneNumber=" + info.phone_number}).done(function (response) {


            if (response["success"]) {

                hidePhoneNumberModal();
                if (followUpAction==CTA.PAYMENT){

                    onForPaymentMobileVerified(info.phone_number);
                    
                }else{
                    
                    onForTryNBuyVerified();
                }


            } else {

                alert("invalid otp");
                jQuery(obj).val("");
            }
        });
    }
}

function changePhoneNumber(){
    jQuery("#userPhoneNumber").show();
    jQuery(".otp-entry").hide();
}

function onPhoneNumberEntered(){

    if (/\d{10,10}/.test(jQuery("#userPhoneNumber").val())){
        info.phone_number=jQuery("#userPhoneNumber").val();
        validatePhone();
    }else{
        $('#phoneModal .error').html('invalid mobile number').fadeIn();
    }
}
function showLoader(){

    jQuery(".loader_wrapper").show();

}
function hideLoader(){

    jQuery(".loader_wrapper").hide();
}

function validatePhone(){
    var inputtxt = info.phone_number;
    var phoneno = /^\d{10}$/;
    if(inputtxt.match(phoneno)) {
        $('#phoneModal .error').html('').hide();

        $('.loader').fadeIn();
        showLoader();
        $.ajax({
            url : '/suggest/sendOtp?phoneNumber='+inputtxt,
            dataType : 'json',
            contentType : "application/json; charset=utf-8",
            header : 'x-requested-with'
        })
            .done(function(result){
                hideLoader();
                $('.loader').fadeOut();
                if(result.success){
                    jQuery("#phoneModal #userPhoneNumber").hide();
                    jQuery("#phoneModal .otp-entry").show();
                }else{
                    $('#phoneModal .error').html('invalid mobile number').fadeIn();
                }
            })
            .fail(function(err){
                $('.loader').fadeOut();
                $('#phoneModal .error').html('invalid mobile number').fadeIn();
            });
    }else {
        $('#phoneModal .error').html('invalid mobile number').fadeIn();
        return false;
    }
}


function showPhoneNumberModal() {
    $('#phoneModal').show();
}
function hidePhoneNumberModal() {
    $('#phoneModal').hide();
}
var followUpAction=0;
function startPaymentProcess(){
    
    followUpAction=CTA.TRYNBUY;
    showPhoneNumberModal();
}
function startTryNBuyProcess(){


    followUpAction=CTA.PAYMENT;
    showPhoneNumberModal();
}

function onForPaymentMobileVerified(phoneNumber){

    showLoader();
    jQuery("body").append("<form  method='post' action='/payment/makePayment' id='paymentForm'><input type='hidden' name='info' value='"+JSON.stringify(info)+"'></form>");
    jQuery("#paymentForm").submit();

}


function onForTryNBuyVerified(){
    
    
    showLoader();
    
    jQuery.ajax({url:"/referral/makeTrialReqForUser?phone_number="+info.phone_number+"&referral_code="+referralCode}).done(function(response){
        
        if (response["success"]){
            
            tryNbuy(response["referral_link"]);
        }
        hideLoader();
    });

}
    populateRoute(1, 1);
    //paymentSuccessful();
    //tryNbuy();
