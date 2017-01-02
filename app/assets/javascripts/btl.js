var URL={

    UPDATE_PROMOTER_LIST:"http://myor.shuttl.com/btl/updatePromoterList"
};

var CONFIGURATION={

    DATA_START_ROW:2,
    COLUMN_PROMOTER_PHONE_NUMBER:2,
    COLUMN_PROMOTER_NAME:3
};


function Promoter(name,number){

    this.name=name;
    this.number=number;
}


function updatePromoterList(e){
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();

    if (ss.getName()!="BTL Promoters"){

        return;
    }

    var range = e.range;
    var row=range.getRow();
    var value=range.getValue();
    var column=range.getColumn();
    if (value="Yes" && row==1 && column==2){
        sendUpdatedPromoterList();
        ss.getRange(1,2,1,1).setValue("No");
        return;

    }

    
}


function sendUpdatedPromoterList(){


    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();

    var currentDataRow=CONFIGURATION.DATA_START_ROW;
    var promoters=[];
    while (1){

        var name=ss.getRange(currentDataRow,CONFIGURATION.COLUMN_PROMOTER_NAME,1,1).getValue();
        var phoneNumber=ss.getRange(currentDataRow,CONFIGURATION.COLUMN_PROMOTER_PHONE_NUMBER,1,1).getValue();

        if (!name || !phoneNumber || name=="" || phoneNumber==""){

            break;
        }else {
            promoters.push(new Promoter(name, phoneNumber));
        }
    }

    sendHttpPost(URL.UPDATE_PROMOTER_LIST,promoters);

}

function sendHttpPost(UrlNewLead,payload) {

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

    resp=UrlNewLeadFetchApp.fetch(UrlNewLead, options);
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