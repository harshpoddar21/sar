/**
 * Created by Rahul Amlekar on 7/11/2016.
 */

'use strict';
var pickupPoints;
var drivers = [];
var DriverErrorCode = {
    "GPS_NOT_AVAILABLE": 8,
    "NO_TRIP_ALLOCATED": 1,
    "DRIVER_CANNOT_BE_TRACKED": 4,
    "TRIP_COMPLETED": 5,
    "UNKNOWN_ERROR": 6,
    "TRIP_NOT_ALLOTED": 7,
    "SUCCESS": 3,
    "TOO_SOON_TO_COMPUTE_ETA": 2
};
var currentTime=Math.floor(Date.now() / 1000);
var routeId=0;
if (currentTime%86400<8*3600){

    routeId=831;
}else{

    routeId=832;
}
function initialize(driver) {

    if (!driver) {
        return;
    }
    var currentStopIndex = 0; // must be in integer between 0 and numberOfStops-1.
    var percentageTimeToNextStop = 0; // value between 0 and 100


    var isEveningRoute = false;
    document.getElementById("route-number").innerHTML=driver.vehicleNo;
    if (driver.status != DriverErrorCode.SUCCESS){

        jQuery(".error-message").html(getHumanReadableErrorFor(driver.status));
        jQuery(".error-grey, .error-white, .error-message").show();
        jQuery(".start-end").hide();
        return;
    } else {

        jQuery(".error-grey, .error-white, .error-message, .start-end").hide();
        jQuery(".start-end").show();
    }
    currentStopIndex = driver.startIndex != null ? driver.startIndex : 0;
    if (currentStopIndex!=0){

        for (var i=0;i<pickupPoints.length;i++){

            if (pickupPoints[i]["id"]==currentStopIndex){

                currentStopIndex=i;
                break;
            }
        }
    }
    percentageTimeToNextStop = driver.complete;

    if (isEveningRoute) {
        pickupPoints.reverse();  // We reverse the pickup points to get the evening route
        document.getElementById("route-title").innerHTML = 'GURGAON to EAST DELHI';
    }

    (function createHTML() {
        var html = "", i;
        for (i = 0; i <= pickupPoints.length - 1; i++) {
            var eta = new Date(drivers[driverSelectedIndex].etas[[pickupPoints[i]["id"]]] * 1000);
            var hour = eta.getHours();
            var minutes = eta.getMinutes();
            if (hour<10) {
                hour = "0" + hour;
            }
            if (minutes< 10) {
                minutes = "0" + minutes;
            }
            var displayEta = (eta.getFullYear()==1970) ? "" :(hour+":"+minutes);
            if (i % 2 == 0) {
                html += '<div id="pickupPoint' + i + '" class="pickupPointRow odd-row">';
                html += '<div class="pickupPointInformation"><div class="pickupPoint">' + pickupPoints[i]["name"] + '</div>';
                html += '<div class="landmark landmark' + i + '">' + displayEta + '</div>';
                html += '</div><div id="circle' + i + '" class="circle"></div>';
                html += '</div>';
            }
            else if (i % 2 == 1) {
                html += '<div id="pickupPoint' + i + '" class="pickupPointRow even-row">';
                html += '<div class="pickupPointInformation"><div class="pickupPoint">' + pickupPoints[i]["name"] + '</div>';
                html += '<div class="landmark landmark' + i + '">' + displayEta + '</div>';
                html += '</div><div id="circle' + i + '" class="circle"></div>';
                html += '</div>';
            }
        }

        document.getElementById("pickup-point-container").innerHTML = html;
    }());

    (function moveShuttlImageToNextStop() {
        var pickupPointCrossed = '', i;

        // color the circles green and red
        for (i = 0; i < pickupPoints.length; i++) {
            var eta=drivers[driverSelectedIndex].etas[pickupPoints[i]["id"]];
            pickupPointCrossed = "circle" + i;
            if (eta==-1) {
                document.getElementById(pickupPointCrossed).className += " point-crossed";
            }
            else if (eta!=-1) {
                if (i== currentStopIndex +1) {
                    document.getElementById(pickupPointCrossed).className += " point-next";
                }
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
jQuery.ajax({url:"/service/getPickUpPointsForRoute?routeId="+routeId}).done(function(response){


    pickupPoints=response["data"];
    initialize(drivers[driverSelectedIndex]);

});
setInterval(
    function() {
        fetchRefreshDataForDriverPosition();


    }, 5000);

function Driver(startIndex,complete,etas,driverId,status,vehicleNo){
    this.startIndex=startIndex;
    this.complete=100*complete;
    this.etas=etas;
    this.id=driverId;
    this.status=status;
    this.vehicleNo=vehicleNo;

}
function fetchRefreshDataForDriverPosition(){

    jQuery.ajax({url:"/service/getDriverInfo?routeId="+831}).done(function(response) {


        drivers=[];
        for (var i = 0; i < response.length; i++) {
            var driverJson = response[i];
            var driver = new Driver(driverJson.fromPointId, driverJson.complete, driverJson["data"]["locationEta"],driverJson["driverId"], driverJson["data"]["status"],driverJson["vehicleNo"]);
            drivers.push(driver);
        }
        initialize(drivers[driverSelectedIndex]);
    });
}

jQuery("#irc_la").click(function(){

    if (driverSelectedIndex>0){
        if(driverSelectedIndex == drivers.length - 1){
            $("#irc_ra").css("color", "black");  // make arrow reappear
        }
        driverSelectedIndex--;
    }
    else {
        $("#irc_la").css("color", "white");  // make arrow disappear
    }

    initialize(drivers[driverSelectedIndex]);

});

jQuery("#irc_ra").click(function(){

    if (driverSelectedIndex<drivers.length-1){
        if (driverSelectedIndex == 0){
            $("#irc_la").css("color", "black"); // make arrow reappear
        }
        driverSelectedIndex++;
    }
    else {
        $("#irc_ra").css("color", "white");   // make arrow disappear
    }

    initialize(drivers[driverSelectedIndex]);

});



function getHumanReadableErrorFor(error){

    if (DriverErrorCode.DRIVER_CANNOT_BE_TRACKED==error){

        return "Tracking for this driver is not available now.Please use lett/right arrow to see other shuttl.";
    }else if (DriverErrorCode.GPS_NOT_AVAILABLE==error){

        return "Tracking for this driver is not available now.Please use lett/right arrow to see other shuttl.";
    }else if (DriverErrorCode.NO_TRIP_ALLOCATED==error){

        return "Please come back 30 mins before trip starts to check the status.Please use lett/right arrow to see other shuttl.";
    }else if (DriverErrorCode.TOO_SOON_TO_COMPUTE_ETA==error){

        return "Please come back 30 mins before trip starts to check the status.Please use lett/right arrow to see other shuttl.";
    }else if (DriverErrorCode.TRIP_COMPLETED==error){

        return "Driver has completed the trip.Please use lett/right arrow to see other shuttl.";
    }else if (DriverErrorCode.UNKNOWN_ERROR==error){

        return "Tracking for this driver is not available now.Please use lett/right arrow to see other shuttl.";
    }else {

        return "";
    }
}
jQuery(".error-message").html("Please wait loading..");
jQuery(".error-grey, .error-white, .error-message").show();

fetchRefreshDataForDriverPosition();


