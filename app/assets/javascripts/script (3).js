var Url={

    "new_lead":"https://myor.shuttl.com/customercare/getData",
    "update_lead_data":"https://myor.shuttl.com/customercare/update_lead_data",
    "send_sms":"https://myor.shuttl.com/customercare/sendsms"
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
var JobStatus={

    "IN_PROGRESS":0,
    "DONE":1
};
var Constants={
    "INTERESTED":0,
    "NOT_INTERESTED":-1,
    "STARTING_DATA_ROW":4
};

function Lead(phone_number,date_aquired,interested,from_point,to_point,no_messages,p_click_message,n_click_message,whatsapp_status,called,response,subscription_status){


    this.phoneNumber=phone_number;
    this.dateAquired=date_aquired;
    this.interested=(interested==Constants.INTERESTED)?"Yes":"No";
    this.fromPoint=from_point;
    this.toPoint=to_point;
    this.noOfMessages=no_messages;
    this.pClickMessage=p_click_message;
    this.nClickMessage=n_click_message;
    this.whatsappAdded=whatsapp_status;
    this.whatsappLeft=whatsapp_status;
    this.called=called==0?"No":"Yes";
    this.response=response==null?"":response;
    this.subscriptionStatus=subscription_status==2?"PLEDGE":subscription_status==1?"SUBSCRIPTION":"NONE";



}
function onChange(e) {
    var ss=SpreadsheetApp.getActive();

    var refreshTheSheetV=ss.getRange("B2").getValue();
    if (refreshTheSheetV=="Yes"){

        refreshTheSheet();
        ss.getRange("B2").setValue("No");
        return;
    }
}


function onEdit(e){

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    var range = e.range;
    var row=range.getRow();
    var value=range.getValue();
    var column=range.getColumn();
    var phoneNumber=ss.getRange(row,SheetColumn.PHONE_NUMBER).getValue();
    if (row==2 && column==2){
        refreshTheSheet();
        return;

    }else if (!(/\d{10,10}/.test(phoneNumber))){

        return;
    }else if (column==SheetColumn.INTERESTED && row>=Constants.STARTING_DATA_ROW){

        changeInterestedStatusForNumber(phoneNumber,range.getValue());

    }else if (column==SheetColumn.CALLED && row>=Constants.STARTING_DATA_ROW){

        changeCalledStatus(phoneNumber,range.getValue());
    }else if (column==SheetColumn.SEND_SMS_LINK && row>=Constants.STARTING_DATA_ROW && ss.getRange(row,SheetColumn.SEND_SMS_LINK,1,1).getValue()=="Yes"){

        sendSMS(phoneNumber,ss.getRange(row,SheetColumn.CONTENT_SMS),ss.getRange(row,SheetColumn.POSITIVE_URL),ss.getRange(row,SheetColumn.NEGATIVE_URL));
        ss.getRange(row,SheetColumn.NO_OF_MESSAGES,1,1).setValue(parseInt(ss.getRange(row,SheetColumn.NO_OF_MESSAGES,1,1).getValue())+1);
        ss.getRange(row,SheetColumn.SEND_SMS_LINK,1,1).setValue("No");
    }

}
function changeInterestedStatusForNumber(phoneNumber,isInterested){

    changeJobStatus(JobStatus.IN_PROGRESS);
    if (isInterested=="Yes"){

        updateKeyValue(phoneNumber,"interested",0);
    }else{

        updateKeyValue(phoneNumber,"interested",-1);
    }

    changeJobStatus(JobStatus.DONE);
}

function changeCalledStatus(phoneNumber,value){

    changeJobStatus(JobStatus.IN_PROGRESS);
    if (value=="yes"){

        updateKeyValue(phoneNumber,"called",1);
    }else{

        updateKeyValue(phoneNumber,"called",0);
    }

    changeJobStatus(JobStatus.DONE);
}

function sendSMS(phoneNumber,message,positiveLink,negativeLink){

    changeJobStatus(JobStatus.IN_PROGRESS);
    sendHttpPost(Url.send_sms,{"phone_number":phoneNumber,"content":message,"pLink":positiveLink,"nLink":negativeLink});

    changeJobStatus(JobStatus.DONE);
}


function updateKeyValue(phoneNumber,key,value){


    a={};
    a[key]=value;
    a["phone_number"]=phoneNumber;
    sendHttpPost(Url.update_lead_data,a);
}
function changeJobStatus(status){


    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    ss.getRange(F1).setValue(status==JobStatus.DONE?"DONE":"IN PROGRESS");

}
function refreshTheSheet(){


    changeJobStatus(JobStatus.IN_PROGRESS);
    clearDataOnSheet();

    var ss = SpreadsheetApp.getActive();
    var fromDate=ss.getRange("B1").getValue();

    Logger.log(fromDate);

    var toDate=ss.getRange("C1").getValue();


    response=sendHttpPost(Url.new_lead,{"fromDate":fromDate.getTime()/1000,"toDate":toDate.getTime()/1000});
    var leads=[];
    if (response!=null && response!=""){

        response=JSON.parse(response);

        for (var i=0;i<response["data"].length;i++){

            var responseO=response["data"][i];
            var lead=new Lead(responseO["phone_number"],responseO["acquired_date"],responseO["interested"],responseO["from_location"],
                responseO["to_location"],responseO["count_link_sent"],responseO["count_clicked_on_positive"],responseO["count_clicked_on_negative"],
                responseO["whatsapp_status"],responseO["called"],responseO["response"],responseO["subscription_status"]);
            leads.push(lead);
        }

        renderLeadsOnSheet(leads);
    }

    ss.getRange("B2").setValue("No");
    changeJobStatus(JobStatus.DONE);

}


function clearDataOnSheet(){

    var ss = SpreadsheetApp.getActive();
    var range = ss.getRange("A4:P10000");
    range.clearContent();

}


function renderLeadsOnSheet(leads){

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
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
}