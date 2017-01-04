var UrlNewLead={

    "new_lead":"https://myor.shuttl.com/lcustomercare/getData",
    "update_lead_data":"https://myor.shuttl.com/lcustomercare/updateLeadData",

};

var SheetColumn={

    "PHONE_NUMBER":1,
    "NO_OF_RIDES":2,
    "SUBSCRIPTION_BOUGHT":3,
    "ROUTE_ID":4,
    "AQUISITION_CHANNEL":5,
    "QUERY":6,
    "PAST_RESPONSE":7,
    "CURRENT_RESPONSE":8,
    "ISSUE":9,
    "UPDATE":10,
};
var JobStatus={

    "IN_PROGRESS":0,
    "DONE":1
};
var Constants={
    "INTERESTED":0,
    "NOT_INTERESTED":1,
    "STARTING_DATA_ROW":4
};

function Lead(phone_number,no_of_rides,subscription_bought,route_id,aquisition_channel,query,past_response){


    this.phoneNumber=phone_number;
    this.noOfRides=no_of_rides;

    this.interested=(interested==Constants.INTERESTED)?"Yes":"No";
    this.subscriptionBought=subscription_bought;
    this.routeId=route_id;
    this.aquistionChannel=aquisition_channel;
    this.query=query;
    this.pastResponse=past_response;

}
function onRefreshNewLeads(e) {
    var ss=SpreadsheetApp.getActive();
    if (ss.getActiveSheet().getName()=="Final Calling Sheet Rohit" || ss.getActiveSheet().getName()=="Final Calling Sheet Ajay"){
        var refreshTheSheetNewLeadV=ss.getRange("G1").getValue();

        if (refreshTheSheetNewLeadV=="Yes"){

            refreshTheSheetNewLead();
        }
    }
}


function onEditNewLead(e){

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    if (!ss.getActiveSheet().getName()=="Final Calling Sheet Rohit" && !ss.getActiveSheet().getName()=="Final Calling Sheet Ajay"){

        return;
    }


    var range = e.range;
    var row=range.getRow();
    var value=range.getValue();
    var column=range.getColumn();
    var phoneNumber=ss.getRange(row,SheetColumn.PHONE_NUMBER).getValue();

    if (column==SheetColumn.UPDATE && row>=Constants.STARTING_DATA_ROW){

        updateDataForRow(row);
    }

}


function getActiveSheet(){


    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();

    return ss;

}
function updateDataForRow(row){

    var currentResponse=getActiveSheet().getRange(row,SheetColumn.CURRENT_RESPONSE,1,1).getValue();
    var result={};
    if (currentResponse!=""){

        result["current_response"]=currentResponse;

    }

    var sendBoardingRequest=getActiveSheet().getRange(row,SheetColumn.UPDATE,1,1).getValue();

    if (sendBoardingRequest=="Yes"){

        result["send_boarding_request"]="yes";
    }
    var issue=getActiveSheet().getRange(row,SheetColumn.ISSUE,1,1).getValue();

    if (issue!=""){

        result["issue"]=issue;

    }

    result["phone_number"]=getActiveSheet().getRange(row,SheetColumn.PHONE_NUMBER,1,1).getValue();



    sendHttpPost(UrlNewLead.update_lead_data,result);
    getActiveSheet().getRange(row,SheetColumn.UPDATE,1,1).setValue("No");

}


function changeJobStatusNewLead(status){


    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    ss.getRange("J1").setValue(status==JobStatus.DONE?"DONE":"IN PROGRESS");

}
function refreshTheSheetNewLead(){


    changeJobStatusNewLead(JobStatus.IN_PROGRESS);
    clearDataOnSheetNewLead();

    var ss = SpreadsheetApp.getActive();
    var fromDate=ss.getRange("B1").getValue();

    Logger.log(fromDate);

    var toDate=ss.getRange("C1").getValue();


    response=sendHttpPost(UrlNewLead.new_lead,{"fromDate":fromDate.getTime()/1000,"toDate":toDate.getTime()/1000});
    var leads=[];
    if (response!=null && response!=""){

        response=JSON.parse(response);

        for (var i=0;i<response["data"].length;i++){

            var responseO=response["data"][i];
            var lead=new Lead(responseO["phone_number"],responseO["no_of_rides"],responseO["subscription_bought"],responseO["route_id"],
                responseO["channel_category_id"],responseO["is_interested"],responseO["past_response"]);
            leads.push(lead);
        }

        renderLeadsOnSheet(leads);
    }

    ss.getRange("G1").setValue("No");
    changeJobStatusNewLead(JobStatus.DONE);

}


function clearDataOnSheetNewLead(){

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
            ss.getRange(row,SheetColumn.AQUISITION_CHANNEL,1,1).setValue(l.aquistionChannel);
            ss.getRange(row,SheetColumn.NO_OF_RIDES,1,1).setValue(l.noOfRides);
            ss.getRange(row,SheetColumn.QUERY,1,1).setValue(l.query);
            ss.getRange(row,SheetColumn.ROUTE_ID,1,1).setValue(l.routeId);
            ss.getRange(row,SheetColumn.SUBSCRIPTION_BOUGHT,1,1).setValue(l.subscriptionBought);

            ss.getRange(row,SheetColumn.PAST_RESPONSE,1,1).setValue(l.pastResponse?l.pastResponse.join(","):"");


        }

    }




}

function wrapTrackingInPayload(payload){


    payload["channel_id"]=getActiveSheet().getRange(1,5,1,1).getValue();
    payload["campaign_id"]="cc_calling";
    payload["channel_category_id"]="call";
    return payload;
}

function sendHttpPost(UrlNewLead,payload) {
    payload=  wrapTrackingInPayload();

    Logger.log(JSON.stringify(payload));
    // Because payload is a JavaScript object, it will be interpreted as
    // an HTML form. (We do not need to specify contentType; it will
    // automatically default to either 'application/x-www-form-UrlNewLeadencoded'
    // or 'multipart/form-data')


    var options =
    {
        "method" : "post",
        "payload" : payload
    };

    resp=UrlFetchApp.fetch(UrlNewLead, options);
    return resp;
    /*
     var i=0;
     for (var key in payload){

     if (i==0){

     UrlNewLead=UrlNewLead+"?"+key+"="+payload[key];
     }else{
     UrlNewLead=UrlNewLead+"&"+key+"="+payload[key];
     }
     i++;
     }
     resp=UrlNewLeadFetchApp.fetch(UrlNewLead);
     return resp;
     */
}