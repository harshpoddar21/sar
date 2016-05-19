/**
 * Created by vinitag on 15-04-2016.
 */
$(document).ready(function(){
    $('#slideLeft').on('click',function(){
        $('.lazypay-info-wrapper').addClass('close');
        $('#openSidebar').show();
    });
    $('#openSidebar').on('click',function(){
        $('.lazypay-info-wrapper').removeClass('close');
        $('#openSidebar').hide();
    });
    jQuery(".lazy-pay").on('click',function(){

        var otp=jQuery("otpforLaypay").val();
        if (otp!="" && /\d+/.test(otp)){
            
        }else{
            jQuery("otpforLaypay").val("");

            alert("Please enter valid otp");
        }

    });
    $('#confirm').on('click',function(){



        if (validateEmail(jQuery("#email").val())) {

            jQuery("#email_form").val(jQuery("#email").val());
            jQuery("#paymentForm").submit();
            

        }else{

            alert("Please enter valid email");
            jQuery("#email").val("");

        }

        /*$('.lazyPasySecConfirm').css('display','none');
        $('.lazyPaySecSave').css('display','block');*/
    });

    $(".popup button").on('click', function(){
        $(".popup, .overlay").hide();
    })
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}