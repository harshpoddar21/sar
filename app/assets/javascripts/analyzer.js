// Replace the variables in this block with real values.
var address = '52.76.110.199';

var user = 'ums_read_only';
var userPwd = 'uro24680';
var db = 'USER_MANAGEMENT_SYSTEMS';
var instanceUrl = 'jdbc:mysql://' + address;
var dbUrl = instanceUrl + '/' + db;
var CONFIGURATION={

    ANALYSIS_START_DATE_CELL:"B2",
    ANALYSIS_END_DATE_CELL:"E2",
    REFRESH_SHEET_TRIGGER_CELL:"B3",
    ROUTE_ID_CELL:"B1",
    DATA_START_CELL:"A6",
    ROW_START_CELL_NO:6,
    DATA_END_CELL:"Q10000",
    ROW_DATA_START_NO:6,
    COLUMN_DATE_NO:1,
    COLUMN_BOOKING_COUNT_NO:2,
    COLUMN_NEW_USER_NO:3,
    COLUMN_TAT_NO:6,
    COLUMN_SUBSCRIBERS_BOOKING_COUNT_NO:4,
    COLUMN_TOTAL_UNIQUE_SUBSCRIBERS_NO:5,
    COLUMN_COMPLAINTS_NO:8,
    ROW_REFRESH_NO:3,
    COLUMN_REFRESH_NO:2,
    COLUMN_NO_RATING_5:9,
    COLUMN_NO_RATING_4:10,
    COLUMN_NO_RATING_3:11,
    COLUMN_NO_RATING_2:12,
    COLUMN_NO_RATING_1:13
};

var SHEET_NAMES={

    COMPLAIN_DETAILS:"Complaints Analyzer"
};
var DATABASE={

    SHUTTL:{

        HOSTNAME:"52.76.232.155",
        USERNAME:"hpoddarIU",
        PASSWORD:"harsh",
        DB_URL:'jdbc:mysql://' +"52.76.232.155:3306/shuttl"
    },
    SAR:{

        HOSTNAME:"52.38.247.134",
        USERNAME:"root",
        PASSWORD:"shuttl@12345",
        DB_URL:'jdbc:mysql://' +"52.38.247.134:3306/sar"

    }
};
// Create a new database within a Cloud SQL instance.
function createDatabase() {
    var conn = Jdbc.getConnection(instanceUrl, root, rootPwd);
    conn.createStatement().execute('CREATE DATABASE ' + db);
}

// Create a new user for your database with full privileges.
function createUser() {
    var conn = Jdbc.getConnection(dbUrl, root, rootPwd);

    var stmt = conn.prepareStatement('CREATE USER ? IDENTIFIED BY ?');
    stmt.setString(1, user);
    stmt.setString(2, userPwd);
    stmt.execute();

    conn.createStatement().execute('GRANT ALL ON `%`.* TO ' + user);
}

// Create a new table in the database.
function createTable() {
    var conn = Jdbc.getConnection(dbUrl, user, userPwd);
    conn.createStatement().execute('CREATE TABLE entries '
        + '(guestName VARCHAR(255), content VARCHAR(255), '
        + 'entryID INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(entryID));');
}

function readQueryFromCellString(cellString){


    var ss=SpreadsheetApp.getActive();

    return ss.getRange(cellString).getValue();

}


function readFromCell(rowNo,columnNo){


    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    return  ss.getRange(rowNo,columnNo,1,1).getValue();

}


function getBookingQuery(analysisStartDate,analysisEndDate,routeId){


    var query="select date(from_unixtime(BOARDING_TIME/1000)) as date_booking,count(*),SUM(if(COUPON_CODE like 'SUB%', 1, 0)) AS subscribers_bookings  from BOOKINGS " +
        "where ROUTE_ID="+routeId+" and BOARDING_TIME>"+(analysisStartDate.getTime())+
        " and  STATUS in ('CONFIRMED','POSTPONED') and BOARDING_TIME<"+(analysisEndDate.getTime())+
        " group by date_booking " +
        " order by date_booking desc";

    return query;
}


function startAnalysis(){


    var isRefreshSheetOkayed=readQueryFromCellString(CONFIGURATION.REFRESH_SHEET_TRIGGER_CELL);

    if (isRefreshSheetOkayed=="Yes"){

        writeDataOnSheetCell(CONFIGURATION.ROW_REFRESH_NO,CONFIGURATION.COLUMN_REFRESH_NO,"No");
        clearDataOnSheet(CONFIGURATION.DATA_START_CELL,CONFIGURATION.DATA_END_CELL);
        var analysisStartDate=readQueryFromCellString(CONFIGURATION.ANALYSIS_START_DATE_CELL);
        var analysisEndDate=readQueryFromCellString(CONFIGURATION.ANALYSIS_END_DATE_CELL);
        var routeId=readQueryFromCellString(CONFIGURATION.ROUTE_ID_CELL);
        var query=getBookingQuery(analysisStartDate,analysisEndDate,routeId);

        var results=readDataFromUMS(query);

        var totalResultRows=results.length;
        for (var i=0;i<results.length;i++){

            writeDataOnSheetCell(CONFIGURATION.ROW_DATA_START_NO+i,CONFIGURATION.COLUMN_DATE_NO,results[i][0]);
            writeDataOnSheetCell(CONFIGURATION.ROW_DATA_START_NO+i,CONFIGURATION.COLUMN_BOOKING_COUNT_NO,results[i][1]);
            writeDataOnSheetCell(CONFIGURATION.ROW_DATA_START_NO+i,CONFIGURATION.COLUMN_SUBSCRIBERS_BOOKING_COUNT_NO,results[i][2]);
        }
        var queryNewUserBooked=getNewUserBooking(analysisStartDate,analysisEndDate,routeId);

        results=readDataFromUMS(queryNewUserBooked);

        for (var i=0;i<results.length;i++){

            writeDataCorrespondingToDate(CONFIGURATION.COLUMN_NEW_USER_NO,results[i][2],results[i][1],totalResultRows,CONFIGURATION.ROW_DATA_START_NO+i);

        }

        var subscriptionPackageQuery=getTotalUniqueSubscriptionCount(routeId);

        results=readDataFromUMS(subscriptionPackageQuery);

        for (var i=0;i<results.length;i++){

            writeDataCorrespondingToDate(CONFIGURATION.COLUMN_TOTAL_UNIQUE_SUBSCRIBERS_NO,results[i][2],results[i][1],totalResultRows,CONFIGURATION.ROW_DATA_START_NO);

        }
        var tatInfoResult=getTatInfo(analysisStartDate,analysisEndDate,routeId);

        for (var key in tatInfoResult){

            writeDataCorrespondingToDate(CONFIGURATION.COLUMN_TAT_NO,key,tatInfoResult[key].join(";"),totalResultRows,CONFIGURATION.ROW_DATA_START_NO);
        }

        var complaintsResults=getNoOfComplaintsDateWise(analysisStartDate,analysisEndDate,routeId);
        Logger.log(complaintsResults);
        for (var key in complaintsResults){

            writeDataCorrespondingToDate(CONFIGURATION.COLUMN_COMPLAINTS_NO,key,complaintsResults[key],totalResultRows,CONFIGURATION.ROW_DATA_START_NO);
        }


        var ratings=getRatings(analysisStart,analysisEnd,routeId);

        for (var date in ratings){


            for (var rating in ratings[date]){

                if (rating==5){

                    writeDataCorrespondingToDate(CONFIGURATION.COLUMN_NO_RATING_5,date,ratings[date][rating],totalResultRows,CONFIGURATION.ROW_DATA_START_NO);


                }else if (rating==4){
                    writeDataCorrespondingToDate(CONFIGURATION.COLUMN_NO_RATING_4,date,ratings[date][rating],totalResultRows,CONFIGURATION.ROW_DATA_START_NO);

                }else if (rating==3){

                    writeDataCorrespondingToDate(CONFIGURATION.COLUMN_NO_RATING_3,date,ratings[date][rating],totalResultRows,CONFIGURATION.ROW_DATA_START_NO);
                }else if (rating==2){

                    writeDataCorrespondingToDate(CONFIGURATION.COLUMN_NO_RATING_2,date,ratings[date][rating],totalResultRows,CONFIGURATION.ROW_DATA_START_NO);
                }else if (rating==1){

                    writeDataCorrespondingToDate(CONFIGURATION.COLUMN_NO_RATING_1,date,ratings[date][rating],totalResultRows,CONFIGURATION.ROW_DATA_START_NO);

                }

            }
        }


    }
}
function readDataFromShuttlDb(query){


    Logger.log(query);
    var conn = Jdbc.getConnection(DATABASE.SHUTTL.DB_URL, DATABASE.SHUTTL.USERNAME, DATABASE.SHUTTL.PASSWORD);

    var stmt = conn.createStatement();

    var results = stmt.executeQuery(query);
    var numCols = results.getMetaData().getColumnCount();

    var resultsFinal=[];
    while (results.next()) {
        var row = [];
        for (var col = 0; col < numCols; col++) {
            row.push(results.getString(col + 1));
        }
        resultsFinal.push(row);
    }

    results.close();
    stmt.close();
    return resultsFinal;
}
function readDataFromSarDb(query){


    Logger.log(query);
    var conn = Jdbc.getConnection(DATABASE.SAR.DB_URL, DATABASE.SAR.USERNAME, DATABASE.SAR.PASSWORD);

    var stmt = conn.createStatement();

    var results = stmt.executeQuery(query);
    var numCols = results.getMetaData().getColumnCount();

    var resultsFinal=[];
    while (results.next()) {
        var row = [];
        for (var col = 0; col < numCols; col++) {
            row.push(results.getString(col + 1));
        }
        resultsFinal.push(row);
    }

    results.close();
    stmt.close();
    return resultsFinal;
}

function getTatInfo(analysisStart,analysisEnd,routeId){

    var query="select id,driverStartTime+19800,(unix_timestamp(date(from_unixtime(driverStartTime)))+19800)*1000 from Trip where driverStartTime+19800>"+(analysisStart.getTime())/1000+" and driverEndTime<="+(analysisEnd.getTime())/1000+" and routeId="+routeId+" order by driverStartTime";

    var tripData=[];
    var tripIds=[];
    var results=readDataFromShuttlDb(query);
    for (var i=0;i<results.length;i++){
        tripIds.push(results[i][0]);
        tripData.push([results[i][0],results[i][1],results[i][2]]);
    }


    var query="select trip_id,max(time)-min(time) from trip_history where trip_id in ("+tripIds.join(",")+") group by trip_id";
    var results1=readDataFromShuttlDb(query);
    for (var i=0;i<results1.length;i++){

        for (var j=0;j<tripData.length;j++){

            if (tripData[j][0]==results1[i][0]){

                tripData[j].push(Math.floor(results1[i][1]/3600)+":"+Math.floor((results1[i][1]%3600)/60));
                break;
            }
        }
    }

    var tatFinalData={};
    for (var i=0;i<tripData.length;i++){

        if (!tatFinalData[tripData[i][2]]){
            tatFinalData[tripData[i][2]]=[];
        }

        tatFinalData[tripData[i][2]].push(tripData[i][3]?tripData[i][3]:"");
    }
    return tatFinalData;
}


function getTotalUniqueSubscriptionCount(routeId){

    var subscriptionPackagesQuery=getSubscriptionPackagesQuery(routeId);

    var results=readDataFromUMS(subscriptionPackagesQuery);

    var packageIds=[];

    for (var i=0;i<results.length;i++){

        packageIds.push(results[i][0]);
    }

    var subscriptionBoughtQuery=getUniqueSubscriptionQueryForPackageIds(packageIds);

    return subscriptionBoughtQuery;
}

function getUniqueSubscriptionQueryForPackageIds(packageIds){


    var query=
        "select date(from_unixtime(a.CREATED_TIME/1000)) as bought_date,count(distinct(a.USER_ID)),unix_timestamp(date(from_unixtime(a.CREATED_TIME/1000)))*1000 from USER_SUBSCRIPTIONS as a "+
        " left join USER_SUBSCRIPTIONS as b on a.USER_ID=b.USER_ID and a.USER_SUBSCRIPTION_ID>b.USER_SUBSCRIPTION_ID where "+
        " a.SUBSCRIPTION_PACKAGE_ID in ("+packageIds.join(",")+") and b.USER_SUBSCRIPTION_ID is null group by bought_date order by bought_date desc";


    return query;
}

function writeDataCorrespondingToDate(columnNo,dateUnix,data,totalResults,afterRow){

    if (afterRow==undefined || afterRow || afterRow<CONFIGURATION.ROW_DATA_START_NO){

        afterRow=CONFIGURATION.ROW_DATA_START_NO;
    }
    afterRow=CONFIGURATION.ROW_DATA_START_NO;


    for (var j=afterRow;j<totalResults+CONFIGURATION.ROW_DATA_START_NO;j++){

        var date=readFromCell(j,CONFIGURATION.COLUMN_DATE_NO);
        if (columnNo==8){

            Logger.log("date is "+date.getTime()+" and unix is "+dateUnix);
        }
        if (date.getTime()==dateUnix-19800000){

            writeDataOnSheetCell(j,columnNo,data);

            break;
        }

    }


}

function writeDataOnSheetCell(rowNo,columnNo,data){

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    ss.getRange(rowNo,columnNo,1,1).setValue(data);
}
function writeDataOnSheet(sheetName,rowNo,columnNo,data){

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getSheetByName(sheetName);
    ss.getRange(rowNo,columnNo,1,1).setValue(data);
}
function clearDataOnSheet(startDataCellString,endDataCellString){

    var ss = SpreadsheetApp.getActive();
    var range = ss.getRange(startDataCellString+":"+endDataCellString);
    range.clearContent();

}


function clearSheet(sheetName){

    var ss= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    ss.getRange(2,1,ss.getMaxRows()-2,ss.getMaxColumns()-1).clearContent();

}


function readDataFromUMS(query) {

    var conn = Jdbc.getConnection(dbUrl, user, userPwd);
    Logger.log(query);
    var stmt = conn.createStatement();

    var results = stmt.executeQuery(query);
    var numCols = results.getMetaData().getColumnCount();

    var resultsFinal=[];
    while (results.next()) {
        var row = [];
        for (var col = 0; col < numCols; col++) {
            row.push(results.getString(col + 1));
        }
        resultsFinal.push(row);
    }

    results.close();
    stmt.close();
    return resultsFinal;
}


function getSubscriptionPackagesQuery(routeId){

    var query="select * from SUBSCRIPTION_PACKAGES where ROUTE_ID="+routeId+" or RETURN_ROUTE_ID="+routeId;

    return query;
}




function getNewUserBooking(analysisStart,analysisEnd,routeId){


    var query="select Date(from_unixtime(a.BOARDING_TIME/1000))  as first_booking_date,count(*),unix_timestamp(Date(from_unixtime(a.BOARDING_TIME/1000)))*1000 " +
        " from BOOKINGS as a " +
        " left join BOOKINGS as b on a.USER_ID=b.USER_ID and (b.BOOKING_ID<a.BOOKING_ID) where " +
        "a.ROUTE_ID="+routeId+"   and (b.ROUTE_ID is null or b.ROUTE_ID="+routeId+") and a.BOARDING_TIME>"+analysisStart.getTime()
        + " and a.BOARDING_TIME<"+analysisEnd.getTime()+" and b.BOOKING_ID is null group by first_booking_date order by first_booking_date desc";

    return query;
}


function getComplaintsQuery(analysisStart,analysisEnd,routeId){


    var query="select id,feedback,trip_rating,(unix_timestamp(Date(created_at)))*1000,description,source from freshdesk_tickets where route_id="+routeId+" and created_at>from_unixtime("+analysisStart.getTime()/1000+") and created_at<from_unixtime("+analysisEnd.getTime()/1000+")";
    return query;
}

function getNoOfComplaintsDateWise(analysisStart,analysisEnd,routeId){

    var complaintsQuery=getComplaintsQuery(analysisStart,analysisEnd,routeId);

    var complaints=readDataFromSarDb(complaintsQuery);
    complaintsLogger(complaints);
    var complaintsCount={};

    Logger.log(complaints);
    for (var i=0;i<complaints.length;i++){


        if (complaintsCount[complaints[i][3]]==null){

            complaintsCount[complaints[i][3]]=1;

        }else{

            complaintsCount[complaints[i][3]]=complaintsCount[complaints[i][3]]+1;

        }


    }

    return complaintsCount;
}


function complaintsLogger(complaints){


    var complaintsAgg={};



    for (var i=0;i<complaints.length;i++){

        if (complaintsAgg[complaints[i][3]]==null){

            complaintsAgg[complaints[i][3]]=[];
        }

        complaintsAgg[complaints[i][3]].push(complaints[i]);


    }



    logAllComplaints(complaintsAgg);

}



function logAllComplaints(complaintsAgg){



    clearSheet(SHEET_NAMES.COMPLAIN_DETAILS);
    var startRow=1;

    for (var key in complaintsAgg){

        startRow++;
        startRow++;
        writeDataOnSheet(SHEET_NAMES.COMPLAIN_DETAILS,startRow,1,"Complaints on Date "+U2Gtime(key));

        startRow++;
        startRow++;
        for (var j=0;j<complaintsAgg[key].length;j++){

            for (var k=0;k<complaintsAgg[key][j].length;k++){

                writeDataOnSheet(SHEET_NAMES.COMPLAIN_DETAILS,startRow,2+k,complaintsAgg[key][j][k]);
            }
            startRow++;
        }



    }
}
function U2Gtime(unixtime) {
    var newDate = new Date( );
    newDate.setTime( unixtime );
    var dateString = newDate.toUTCString( );
    return dateString;
}

function tripRatingQuery(analysisStartDate,analysisEndDate,routeId){

    var query="select RATING,count(*),unix_timestamp(Date(from_unixtime(b.BOARDING_TIME/1000)))*1000 as booking_date_unix from USER_TRIP_RATINGS as a join BOOKINGS as b on a.BOOKING_ID=b.BOOKING_ID where b.ROUTE_ID="+routeId+" and b.BOARDING_TIME>"+analysisStartDate.getTime()+" and b.BOARDING_TIME<"+analysisEndDate.getTime()+" group by RATING,booking_date_unix";
    return query;
}​

function getRatings(analysisStartDate,analysisEndDate,routeId){

    var ratings=tripRatingQuery(analysisStartDate,analysisEndDate,routeId);

    var results={};

    for (var i=0;i<ratings.length;i++){


        if (results[ratings[i][2]]==null){

            results[ratings[i][2]]={};

        }

        results[ratings[i][2]][ratings[i][0]]=ratings[i][1];


    }

    return results;
}