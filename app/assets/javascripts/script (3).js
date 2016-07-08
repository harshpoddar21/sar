var Url={

    "new_lead":"https://myor.shuttl.com/customercare/fetchData"
};

var SheetColumn={

    "PHONE_NUMBER":1,
    "DATE_AQUIRED":2,
    "INTERESTED":3,
    "SUBSCRIPTION_STATUS":4,
    "FROM_POINT":5,
    "TO_POINT":6,
    "NO_OF_MESSAGES":7,
    "CLICKED_ON_POSITIVE":8,
    "CLICKED_ON_NEGATIVE":9,
    "ADDED_ON_WHATSAPP":10,
    "LEFT_WHATSAPP":11,
    "POSITIVE_URL":12,
    "NEGATIVE_URL":13,
    "CONTENT_SMS":14,
    "SEND_SMS_LINK":15,
    "CALLED":16,
    "RESPONSE":17

};

function Lead(phone_number,date_aquired,interested,from_point,to_point,no_messages,p_click_message,n_click_message,whatsapp_status,called,response,subscription_status){


    this.phoneNumber=phone_number;
    this.dateAquired=date_aquired;
    this.interested=interested;
    this.fromPoint=from_point;
    this.toPoint=to_point;
    this.noOfMessages=no_messages;
    this.pClickMessage=p_click_message;
    this.nClickMessage=n_click_message;
    this.whatsappAdded=whatsapp_status;
    this.whatsappLeft=whatsapp_status;
    this.called=called;
    this.response=response;
    this.subscriptionStatus=subscription_status;



}
function onChange(e) {
    var ss=SpreadsheetApp.getActive();

    var refreshTheSheetV=ss.getRange("B2").getValue();
    if (refreshTheSheetV=="Yes"){

        refreshTheSheet();
        return;
    }



}

function refreshTheSheet(){
    clearDataOnSheet();
    var fromDate=ss.getRange("B1").getValue();
    var toDate=ss.getRange("C1").getValue();

    response=sendHttpPost(Url.new_lead,{"fromDate":fromDate,"toDate":toDate});
    var leads=[];
    if (response!=null && response!=""){

        response=JSON.parse(response);

        for (var i=0;i<response["data"].length;i++){

            var responseO=response[i];
            var lead=new Lead(responseO["phone_number"],responseO["acquired_date"],responseO["interested"],responseO["from_point"],
                responseO["to_point"],responseO["count_link_sent"],responseO["count_clicked_on_positive"],responseO["count_clicked_on_negative"],
                responseO["whatsapp_status"],responseO["called"],responseO["response"],responseO["subscription_status"]);
            leads.push(lead);
        }

        renderLeadsOnSheet(leads);
    }


}


function clearDataOnSheet(){

    var ss = SpreadsheetApp.getActive();
    var range = sheet.getRange("A4:P10000");
    range.clearContent();

}


function renderLeadsOnSheet(leads){


    var ss=SpreadsheetApp.getActive();
    if (leads!=null && leads.length>0){


        for (var i=0;i<leads.length;i++){

            var l=leads[i];
            var row=i+4;
            ss.getRange(row,SheetColumn.PHONE_NUMBER,1,1).setValue(l.phoneNumber);
            ss.getRange(row,SheetColumn.DATE_AQUIRED,1,1).setValue(l.dateAquired);
            ss.getRange(row,SheetColumn.INTERESTED,1,1).setValue(l.interested);
            ss.getRange(row,SheetColumn.FROM_POINT,1,1).setValue(l.fromPoint);
            ss.getRange(row,SheetColumn.TO_POINT,1,1).setValue(l.toPoint);
            ss.getRange(row,SheetColumn.NO_OF_MESSAGES,1,1).setValue(l.noOfMessages);
            ss.getRange(row,SheetColumn.CLICKED_ON_POSITIVE,1,1).setValue(l.pClickMessage);
            ss.getRange(row,SheetColumn.CLICKED_ON_NEGATIVE,1,1).setValue(l.nClickMessage);
            ss.getRange(row,SheetColumn.ADDED_ON_WHATSAPP,1,1).setValue(l.whatsappAdded);
            ss.getRange(row,SheetColumn.LEFT_WHATSAPP,1,1).setValue(l.whatsappLeft);
            ss.getRange(row,SheetColumn.CALLED,1,1).setValue(l.called);
            ss.getRange(row,SheetColumn.RESPONSE,1,1).setValue(l.response);
            ss.getRange(row,SheetColumn.SEND_SMS_LINK,1,1).setValue("No");
            ss.getRange(row,SheetColumn.SUBSCRIPTION_STATUS,1,1).setValue(l.subscriptionStatus);

        }

    }




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
}