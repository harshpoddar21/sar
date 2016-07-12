var URL={

    "BOOKINGS":"http://myor.shuttl.com/customercare/getBookingDetails"
};

var FORWARD_ROUTE=[586,831];
var REVERSE_ROUTE=[587,832];

var CONFIGURATIONS={

    DATA_START_INDEX:4,
    SHEET_COLUMN:{

        "BOOKING_ID":1,
        "PHONE_NUMBER":2,
        "USER_ID":3,
        "TOTAL_FORWARD_BOOKINGS":4,
        "TOTAL_REVERSE_COOKINGS":5,
        "LAST_BOOKING_FORWARD":6,
        "LAST_BOOKING_REVERSE":7,
        "APP_INSTALLED":8,
        "DISCOUNTED_FARE":9,
        "SUBSCRIPTION_TYPE":10,
        "TRIP_RATING":11,
        "WHATSAPP_STATUS":12,
        "POSITIVE_URL":13,
        "NEGATIVE_URL":14,
        "CONTENT_SMS":15,
        "CALLED":16,
        "RESPONSE":17

    }
};

function BookingUser(bookingId,phoneNumber,userId,totalForwardBooking,totalReverseBooking,lastForwardBookingTime,lastReverseBookingTime,discountedFare,subscriptionType,tripRating,whatsAppStatus,called,response){

    this.userId=userId;
    this.bookingId=bookingId;
    this.phoneNumber=phoneNumber;
    this.totalForwardBooking=totalForwardBooking;
    this.totalReverseBooking=totalReverseBooking;
    this.lastForwardBooking=new Date(lastForwardBookingTime);
    this.lastReverseBooking=new Date(lastReverseBookingTime);
    this.discountedFare=discountedFare;
    this.subscriptionType=subscriptionType;
    this.tripRating=tripRating;
    this.whatsAppStatus=whatsAppStatus;
    this.called=called?"Yes":"No";
    this.response=response!=null?response:"";


}

function getRelevantBookingDetails(totalBookingDetails,fromDate,toDate){


    var forwardBookings=0;
    var reverseBookings=0;
    var relevantBookings=[];
    var lastForwardBookingTime=0;
    var lastReverseBookingTime=0;

    if (totalBookingDetails[totalBookingDetails.length-1]["BOARDING_TIME"]>toDate || totalBookingDetails[totalBookingDetails.length-1]["BOARDING_TIME"]<fromDate){

        return null;

    }
    for (var i=0;i<totalBookingDetails.length;i++){


        for (var j=0;j<FORWARD_ROUTE.length;j++){

            if (FORWARD_ROUTE[j]==totalBookingDetails[i]["ROUTE_ID"]){
                forwardBookings++;
                lastForwardBookingTime=totalBookingDetails[i]["BOARDING_TIME"];
                continue;
            }
            if (REVERSE_ROUTE[j]==totalBookingDetails[i]["ROUTE_ID"]){

                reverseBookings++;
                lastReverseBookingTime=totalBookingDetails[i]["BOARDING_TIME"];
                continue;
            }


        }

    }
    for (var i=0;i<totalBookingDetails.length;i++){


        var rBook=totalBookingDetails[i];
        if (rBook["BOARDING_TIME"]>=fromDate && rBook["BOARDING_TIME"]<=toDate){

            relevantBookings.push(new BookingUser(rBook["BOOKING_ID"],rBook["PHONE_NUMBER"],rBook["USER_ID"],forwardBookings,reverseBookings,lastForwardBookingTime,lastReverseBookingTime,rBook["DISCOUNTED_FARE"],rBook["COUPON_CODE"],rBook["TRIP_RATING"],rBook["called"],rBook["response"]));
        }




    }

    return relevantBookings;
}

function onChangeBookings(e) {
    var ss=SpreadsheetApp.getActive();

    if (ss.getActiveSheet().getName()=="Bookings"){

        var refreshTheSheetV=ss.getRange("B2").getValue();

        if (refreshTheSheetV=="Yes"){

            refreshTheBookingSheet();
        }
    }
}


function refreshTheBookingSheet(){


    var fromDate=ss.getRange("B1").getValue();
    var toDate=ss.getRange("C1").getValue();

    var response=sendHttpPost(URL.BOOKINGS,{"fromDate":fromDate.getTime()/1000,"toDate":toDate.getTime()/1000});
    response=JSON.parse(response);
    var overallRelevantBookings=[];
    for (userid in response){

        var userLastBoardingTime=response[userid][response[userid].length-1]["BOARDING_TIME"];
        if (userLastBoardingTime>=fromDate.getTime() && userLastBoardingTime<=toDate.getTime()){

           var relevantBookings=getRelevantBookingDetails(response[userid],fromDate.getTime(),toDate.getTime());

            if (relevantBookings!=null){

                for (var i=0;i<relevantBookings.length;i++){


                    overallRelevantBookings.push(relevantBookings[i]);
                }
            }
        }
    }

    renderBookings(overallRelevantBookings);
    
}


function renderBookings(bookings){

    clearDataOnSheet();
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    for (var i=0;i<bookings.length;i++){

        var l=bookings[i];

        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.PHONE_NUMBER,1,1).setValue(l.phoneNumber);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.BOOKING_ID,1,1).setValue(l.bookingId);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.USER_ID,1,1).setValue(l.userId);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.CALLED,1,1).setValue(l.called);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.RESPONSE,1,1).setValue(l.response);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.LAST_BOOKING_FORWARD,1,1).setValue(l.lastForwardBooking);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.LAST_BOOKING_REVERSE,1,1).setValue(l.lastReverseBooking);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.TOTAL_FORWARD_BOOKINGS,1,1).setValue(l.totalForwardBooking);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.TOTAL_REVERSE_COOKINGS,1,1).setValue(l.totalReverseBooking);
        ss.getRange(CONFIGURATIONS.DATA_START_INDEX+i,CONFIGURATIONS.SHEET_COLUMN.DISCOUNTED_FARE,1,1).setValue(l.discountedFare);
        

    }
    
    
}




function clearDataOnSheet(){

        var ss = SpreadsheetApp.getActive();
        var range = ss.getRange("A"+CONFIGURATIONS.DATA_START_INDEX+":P10000");
        range.clearContent();

    }



function sendHttpPost(url,payload) {

    Logger.log(JSON.stringify(payload));
    // Because payload is a JavaScript object, it will be interpreted as
    // an HTML form. (We do not need to specify contentType; it will
    // automatically default to either 'application/x-www-form-urlencoded'
    // or 'multipart/form-data')


    var options =
    {
        "method" : "post",
        "payload" : payload
    };

    resp=UrlFetchApp.fetch(url, options);
    return resp;
    /*
     var i=0;
     for (var key in payload){

     if (i==0){

     url=url+"?"+key+"="+payload[key];
     }else{
     url=url+"&"+key+"="+payload[key];
     }
     i++;
     }
     resp=UrlFetchApp.fetch(url);
     return resp;
     */
}


