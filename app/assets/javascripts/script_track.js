/**
 * Created by Rahul Amlekar on 7/11/2016.
 */

/*jslint browser:true */
/*jslint todo: true */
/*jslint node: true */
/*jslint plusplus: true */

'use strict';
var pickupPoints;var drivers=[];
var DriverErrorCode={
    "GPS_NOT_AVAILABLE":8,
    "NO_TRIP_ALLOCATED":1,
"DRIVER_CANNOT_BE_TRACKED":4,
    "TRIP_COMPLETED":5,
"UNKNOWN_ERROR":6,
"TRIP_NOT_ALLOTED":7,
"SUCCESS":3,
"TOO_SOON_TO_COMPUTE_ETA":2
};
function initialize(driver) {
    
    if (!driver){
        return;
    }
    /*TODO
    *
    * Fill the following two values from the back end
    *
    * */
    var currentStopIndex = 0; // must be in integer between 0 and 8.
    var percentageTimeToNextStop = 0; // value between 0 and 100

    
    var isEveningRoute = false;

    
    if (driver.status!=DriverErrorCode.SUCCESS){

        jQuery(".errorBlock").html(getHumanReadableErrorFor(driver.status));
        jQuery(".errorBlock").show();
        document.getElementById("pickup-point-container").innerHTML="";
        return;
    }else{

        jQuery(".errorBlock").hide();
    }
    currentStopIndex=driver.startIndex!=null?driver.startIndex:0;
    percentageTimeToNextStop=driver.complete;

    if (isEveningRoute) {
        pickupPoints.reverse();  // We reverse the pickup points to get the evening route
        document.getElementById("route-title").innerHTML = 'GURGAON to EAST DELHI';
    }

    (function createHTML() {
        var html = "", i;
        for (i = 0; i <= pickupPoints.length-1; i++) {
            var eta=new Date(drivers[driverSelectedIndex].etas[[pickupPoints[i]["id"]]]*1000);
            var hour=eta.getHours();
            var minutes=eta.getMinutes();
            if (hour.length==1){

                hour="0"+hour;
            }
            if (minutes.length==1){

                minutes="0"+minutes;
            }

            html += '<div id="pickupPoint' + i + '" class="pickupPointRow odd-row">';
            html += '<div class="pickupPointInformation"><div class="pickupPoint">' + pickupPoints[i]["name"] + '</div>';
            html += '<div class="landmark landmark' + i + '">' + (eta.getYear()==70)?"":(hour+":"+minutes) + '</div></div>';
            html += '<div id="circle' + i + '" class="circle"></div>';
            html += '</div>';
            i += 1;
            if (i < pickupPoints.length) {
                html += '<div id="pickupPoint' + i + '" class="pickupPointRow even-row">';
                html += '<div class="pickupPointInformation"><div class="pickupPoint">' + pickupPoints[i]["name"] + '</div>';
                html += '<div class="landmark landmark' + i + '">' + (eta.getYear()==70)?"":(hour+":"+minutes) + '</div></div>';
                html += '<div id="circle' + i + '" class="circle"></div>';

                html += '</div>';
            }
        }
        document.getElementById("pickup-point-container").innerHTML = html;
    }());

    (function moveShuttlImageToNextStop() {
        var pickupPointCrossed = '', i;

        // color the circles green and red
        for (i = 0; i<pickupPoints.length; i++) {
            var eta=drivers[driverSelectedIndex].etas[pickupPoints[i]["id"]];
            if (eta==-1) {
                pickupPointCrossed = "circle" + i;
                document.getElementById(pickupPointCrossed).className += " point-crossed";
            }
        }
        for (i = currentStopIndex + 1; i < pickupPoints.length; i++) {
            pickupPointCrossed = "circle" + i;
            var eta=drivers[driverSelectedIndex].etas[pickupPoints[i]["id"]];
            if (eta!=-1) {
                document.getElementById(pickupPointCrossed).className += " point-next";
            }
            else {
                document.getElementById(pickupPointCrossed).className += " points-left";
                 }
        }
        /*for (i = 0; i <= currentStopIndex; i++) {
            pickupPointCrossed = "landmark" + i;
            document.getElementById(pickupPointCrossed).className += " point-crossed";
        }*/
        var viewportHeight = window.innerHeight;
        var displacementBetweenStopsInMap = Math.floor(viewportHeight / 14);
        var pixelsFromTop = 29 + (currentStopIndex * displacementBetweenStopsInMap) + (displacementBetweenStopsInMap * percentageTimeToNextStop / 100); // 29 is the pixels required to move Shuttl to the first stop
        document.getElementById('shuttl-image-id').style.top = pixelsFromTop + 'px';

    }());
}

var driverSelectedIndex=0;
jQuery.ajax({url:"/service/getPickUpPointsForRoute?routeId=831"}).done(function(response){


    pickupPoints=response["data"];
    initialize(drivers[driverSelectedIndex]);

});
setInterval(
    function() {
    fetchRefreshDataForDriverPosition();


    }, 5000);

function Driver(startIndex,complete,etas,driverId,status){
    this.startIndex=startIndex;
    this.complete=100*complete;
    this.etas=etas;
    this.id=driverId;
    this.status=status;

}
function fetchRefreshDataForDriverPosition(){

    jQuery.ajax({url:"/service/getDriverInfo?routeId="+831}).done(function(response) {


        drivers=[];
            for (var i = 0; i < response.length; i++) {
                var driverJson = response[i];
                var driver = new Driver(driverJson.fromPointId, driverJson.complete, driverJson["data"]["locationEta"],driverJson["driverId"], driverJson["data"]["status"]);
                drivers.push(driver);
            }
        initialize(drivers[driverSelectedIndex]);

    });
    
}

jQuery("#irc_la").click(function(){

    if (driverSelectedIndex>0){

        driverSelectedIndex--;
    }

    initialize(drivers[driverSelectedIndex]);

});

jQuery("#irc_ra").click(function(){

    if (driverSelectedIndex<drivers.length-1){

        driverSelectedIndex++;
    }

    initialize(drivers[driverSelectedIndex]);

});


function getHumanReadableErrorFor(error){

    if (DriverErrorCode.DRIVER_CANNOT_BE_TRACKED==error){

        return "Tracking for this driver is not available now.";
    }else if (DriverErrorCode.GPS_NOT_AVAILABLE==error){

        return "Tracking for this driver is not available now.";
    }else if (DriverErrorCode.NO_TRIP_ALLOCATED==error){

        return "Please come back 30 mins before trip starts to check the status";
    }else if (DriverErrorCode.TOO_SOON_TO_COMPUTE_ETA==error){

        return "Please come back 30 mins before trip starts to check the status";
    }else if (DriverErrorCode.TRIP_COMPLETED==error){

        return "Driver has completed the trip";
    }else if (DriverErrorCode.UNKNOWN_ERROR==error){

        return "Tracking for this driver is not available now.";
    }else {

        return "";
    }
}




