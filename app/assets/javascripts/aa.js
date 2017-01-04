var columnNames=[];
function getActiveSheet(){


    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    return ss;
}

function submitData(){


    columnNames=[];
    var columnNo=1;
    while (1){

       var value= getActiveSheet.getRange(1,columnNo,1,1).getValue();
        if (value!=""){

            columnNames.push(value);
        }else{

            break;
        }
    }


    var dataStartRow=2;
    var payload=[];
    while(isLastRow(dataStartRow)){

        var data={};
        for (var i=0;i<columnNames.length;i++){


            data[columnNames[i]]=getActiveSheet().getRange(dataStartRow,i+1,1,1).getValue();

        }
        payload.push(data);
        dataStartRow++;
    }


    sendHttpPost(getActiveSheet().getRange(1,2,1,1).getValue(),payload);
    getActiveSheet().getRange(1,3,1,1).setValue("DONE");

}


function isLastRow(rowNo){

    var i=1;
    while (i<=columnNames.length){
        var colValue=getActiveSheet().getRange(rowNo,i,1,1).getValue();
        if (colValue!=""){

            return false;
        }
        i++;
    }
    return true;
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
        'contentType': 'application/json',
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