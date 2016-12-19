
var SELECTION={

    LOCATION:{

        GURGAON:1,
        NOIDA:2,
        DELHI:3,
        FARIDABAD:4,
        NONE:-1
    },

    SELECTED:-1,
    changeSelection:function(obj){

        var selected=jQuery(obj).attr("data");

        this.SELECTED=selected;

        onLocationChanged();
    },

};

function onLocationChanged(){

    jQuery('.city li').each(function(index,thi){

        jQuery(thi).removeClass("selected").find("img").attr("src",jQuery(thi).find("img").attr("data-unclicked"));
    });

    jQuery('.city li[data="'+SELECTION.SELECTED+'"]').addClass("selected").find("img").attr("src",
        jQuery('.city li[data="'+SELECTION.SELECTED+'"]').find("img").attr("data-clicked"));

}


function placeBooking(){


    var phoneNumber=jQuery("#phone_number").val();

    if (/\d{10,10}/.test(phoneNumber)){

        if (SELECTION.SELECTED!=SELECTION.LOCATION.NONE){


            jQuery.ajax({url:"/referral/submitBooking?phoneNumber="+phoneNumber+"&destination="+SELECTION.SELECTED+"&origin="+SELECTION.LOCATION.FARIDABAD}).done(function(){

                alert("Awesome your Booking Placed. We will get in touch with you shortly. Meanwhile please download Shuttl App to start Shuttling.");

                window.location.href="http://bit.ly/downloadShuttl";
            });



        }else{

            alert("Please select a location first");
        }
    }else{

        alert("Invalid Phone Number");
    }

}

jQuery(document).ready(function(){




});