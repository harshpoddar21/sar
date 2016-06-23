/* google auto suggester */

var px = 0;
var refer = {};
var info = {};
var fw = true;
var responseJson;
var slotBtns = '';
var slotBtnsM = '';
var slotBtnsE = '';
var morningSlot = 0;
var eveningSlot = 88;
var reg;
var sub;
var slots_final=[];
var isSubscribed = false;
var origin_index=0;
var duration;

var triedOnceAuto=false;
function initAutocomplete() {
    if ((window.location.search!="" && window.location.search.match(/paths=([^\&]*)/g)!=null && window.location.search.match(/paths=([^\&]*)/g).length>0 && window.location.search.match(/paths=([^\&]*)/g)[0].split("=")[1]!="")){

        var polyline=window.location.search.match(/paths=([^\&]*)/g)[0].split("=")[1];
        var points=google.maps.geometry.encoding.decodePath(polyline);

        if (points.length==2) {
            var fromAdd = getGeoCodedAddress(points[0],function(result){

                info.homeAddress = result.formatted_address;
                info.homelat = points[0].lat();
                info.homelng = points[0].lng();
                jQuery("#homeLocation").val(info.homeAddress);

                if (info.homeAddress!=null && info.officeAddress!=null){

                    jQuery('.downArr').show();

                    fillAdministrativeLevelDetails();

                    if (!triedOnceAuto) {
                        createRoute();
                        triedOnceAuto=true;
                    }
                }

            });
            var toAddress = getGeoCodedAddress(points[1],function(result){

                info.officeAddress = result.formatted_address;
                info.officelat=points[1].lat();
                info.officelng=points[1].lng();
                jQuery("#officeLocation").val(info.officeAddress);
                if (info.homeAddress!=null && info.officeAddress!=null){

                    jQuery('.downArr').show();

                    fillAdministrativeLevelDetails();

                    if (!triedOnceAuto) {
                        createRoute();
                        triedOnceAuto=true;
                    }
                }
            });


        }


    }
    if( (document.getElementById('officeLocation') != null) && (document.getElementById('homeLocation') != null) ){
        var options = {
            componentRestrictions:{country: 'in'}
        };

        var homelocation = new google.maps.places.Autocomplete(
            (document.getElementById('homeLocation')), options);

        var officelocation = new google.maps.places.Autocomplete(
            (document.getElementById('officeLocation')), options);

        homelocation.addListener('place_changed', function() {
            $('.bounce').hide();
            var place1 = homelocation.getPlace();
            info.homeName = place1.name;
            info.homeAddress = place1.formatted_address;
            info.homelat = place1.geometry.location.lat();
            info.homelng = place1.geometry.location.lng();

            fillAdministrativeLevelDetails();

            if (info.officeAddress){
                createRoute();
            }
        });
        officelocation.addListener('place_changed', function() {
            var place1 = officelocation.getPlace();
            info.officeName = place1.name;
            info.officeAddress = place1.formatted_address;
            info.officelat = place1.geometry.location.lat();
            info.officelng = place1.geometry.location.lng();

            fillAdministrativeLevelDetails();
            if (info.homeAddress){
                createRoute();
            }

        });



        function createRoute() {
            $('.bounce').show();
            var poly = new google.maps.Polyline({
                strokeColor: '#000000',
                strokeOpacity: 1,
                strokeWeight: 3
            });
            var path=poly.getPath();
            path.push(new google.maps.LatLng(info.homelat,info.homelng));
            path.push(new google.maps.LatLng(info.officelat,info.officelng));
            var encodedPoints=google.maps.geometry.encoding.encodePath(path);

            showLoader();
            $.ajax({
                url:'http://bus2work.in/suggest/getSlots?path='+encodedPoints
            }).done(function(response){
                responseJson = response;
                hideLoader();
                if(response.route_type == 'Live_route' || response.route_type == 'suggested_route'){
                    var slot = response.slots;
                    info.route_type=response.route_type;
                    info.routeid=response.route_id;
                    info.pricing=response.pricing;
                    info.pick=response.pick;
                    slots_final=response.slots;
                    for (var i=0;i<slots_final.length;i++){

                        if (slots_final[i]>19*60){

                            eveningSlot=i;
                            break;
                        }
                    }
                    info.pricing=response.pricing;
                    $.each(slot, function(key, value){
                        var time = formatSectoIST(value*60);
                        if (time.indexOf("AM")!="-1") {
                            slotBtnsM += '<div class="item"><button type="button" class=" btn btn-default btnTime" data-value="' + time + '">' + time + '<span style="display:none;" class="live">(live)</span></button></div>';
                        }else{

                            slotBtnsE += '<div class="item"><button type="button" class=" btn btn-default btnTime" data-value="' + time + '">' + time + '<span style="display:none;" class="live">(live)</span></button></div>';
                        }
                    });
                    stage = 8;
                    window.location.hash = 'stage'+stage;
                    var handle = $('.screenWrapper').find('.screen');
                    var px = $(handle).outerHeight();
                    var newHandle = createScreenBox(handle, 'after', px);
                    setHeight();
                    $(handle).css('top','-'+px+'px')
                    setTimeout(function(){
                        $(newHandle).css('top','0');
                    },0);
                    setTimeout(function(){
                        $(handle).remove();
                    },300);
                }else{
                    $('.downArr .fa-angle-double-down').trigger('click');
                }
            })
        }

    }
}
/* google auto suggestor */

function Deg2Rad( deg ) {
    return deg * Math.PI / 180;
}

function Haversine( lat1, lon1, lat2, lon2 )
{
    var R = 6372.8;
    var dLat = Deg2Rad(lat2-lat1);
    var dLon = Deg2Rad(lon2-lon1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(Deg2Rad(lat1)) * Math.cos(Deg2Rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}
var closest = 0;
var mindist = 99999;
$(window).resize(function(){
    if($('#gMap').length){
        initMap(responseJson,"OTD");
    }
});
function initMap(response,type) {
    $('#gMap').html('');
    var wpx = $('.screen .col-md-12').width();
    var hpx = $('.screen').height()/2.5+0;
    $('#gMap').css({'width':wpx+'px', 'height':hpx+'px'});

    map = new google.maps.Map(document.getElementById('gMap'), {
        zoomControl: false,
        zoom:1,
        mapTypeControl: false,
        streetViewControl: false
    });
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        FullScreenControl(map, "Full screen",
            "Exit full screen"));

    var origin = new google.maps.Marker({
        position: {lat: response.origin.lat, lng: response.origin.lng},
        map: map,
        icon: '/images/home.png'
    });

    var destination = new google.maps.Marker({
        position: {lat: response.destination.lat, lng: response.destination.lng},
        map: map,
        icon: '/images/office.png'
    });

    var decodedPath = google.maps.geometry.encoding.decodePath(response.points);
    bounds = new google.maps.LatLngBounds();


    $.each(decodedPath, function(key, value){
        var position = new google.maps.LatLng(decodedPath[key].lat(), decodedPath[key].lng());


        var dist;
        if(fw){
            dist = Haversine( decodedPath[key].lat(), decodedPath[key].lng(), response.origin.lat, response.origin.lng );
        }else{
            dist = Haversine( decodedPath[key].lat(), decodedPath[key].lng(), response.destination.lat, response.destination.lng );
        }

        if ( dist < mindist )
        {
            closest = key;
            mindist = dist;
        }
    });


    if (info["pick"]!=null && info.pick.length>0){


        var min_dis=100000;
        for (var i=0;i<info.pick.length;i++){

            if (Haversine(info.pick[i]["lat"],info.pick[i]["lng"],info.homelat,info.homelng)<min_dis){

                origin_index=i;
                min_dis=Haversine(info.pick[i]["lat"],info.pick[i]["lng"],info.homelat,info.homelng);

            }
        }
        /*
         setTimeout(function () {
         var bounds1=new google.maps.LatLngBounds();
         bounds1.extend(new google.maps.LatLng(decodedPath[origin_index].lat(),decodedPath[origin_index].lng()));
         bounds1.extend(new google.maps.LatLng(decodedPath[decodedPath.length-origin_index>3?origin_index+2:decodedPath.length-1].lat(),decodedPath[decodedPath.length-origin_index>3?origin_index+2:decodedPath.length-1].lng()));

         map.fitBounds(bounds1);
         },2000);
         */
    }
    var latlng=null;
    if (info.pick==null || info.pick.length==0) {
        latlng = new google.maps.LatLng(decodedPath[0].lat(), decodedPath[0].lng());
    }else{

        latlng = new google.maps.LatLng(info.pick[origin_index]["lat"], info.pick[origin_index]["lng"]);
    }
    if (type!="OTD"){

        latlng = new google.maps.LatLng( decodedPath[decodedPath.length-1].lat(), decodedPath[decodedPath.length-1].lng() );
    }

    /*
     var marker2 = new google.maps.Marker( { 
     position: latlng,     
     map: map,      
     title: Math.round(Number(mindist)*1000*0.00944) + " min walk", // 0.0105787 is the time in minutes to walk a meter
     icon: '/images/bus-stop.png'
     });
     */
    var contentString = Math.round(Number(mindist)*1000*0.009944) + " min walk";    // HTML text to display in the InfoWindow
    /*
     var infowindow = new google.maps.InfoWindow( { content: contentString } );  
     infowindow.open( map, marker2 );

     google.maps.event.addListener( marker2, 'click', function() { infowindow.open( map, marker2 ); });
     */

    var directionsService = new google.maps.DirectionsService;

    var directionsService1 = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    directionsDisplay.setMap(map);

    var originPts;
    if(type=="OTD"){
        originPts = new google.maps.LatLng(info.homelat,info.homelng);
    }else{
        originPts =new google.maps.LatLng(info.officelat,info.officelng);

    }
    var destinationPts;
    if(type=="OTD"){
        destinationPts = new google.maps.LatLng(info.officelat,info.officelng);
    }else{
        destinationPts = new google.maps.LatLng(info.homelat,info.homelng);
    }
    directionsService.route({
        origin: originPts,
        destination: latlng,
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);

            directionsService1.route({
                origin: latlng,
                destination: destinationPts,
                travelMode: google.maps.TravelMode.DRIVING
            }, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    if (response.routes[0]!=null &&response.routes[0].legs[0]!=null && response.routes[0].legs[0].duration){

                        info["duration"]=response.routes[0].legs[0].duration.value;
                        info["distance"]=response.routes[0].legs[0].distance.value;

                    }
                    if (type=="OTD") {
                        bounds.extend(new google.maps.LatLng(decodedPath[0].lat(), decodedPath[0].lng()));
                        bounds.extend(new google.maps.LatLng(info.pick[origin_index]["lat"], info.pick[origin_index]["lng"]));
                    }else{

                        bounds.extend(new google.maps.LatLng(decodedPath[decodedPath.length-1].lat(), decodedPath[decodedPath.length-1].lng()));
                        bounds.extend(new google.maps.LatLng(decodedPath[decodedPath.length-2].lat(), decodedPath[decodedPath.length-2].lng()));
                    }
                    map.setZoom(15);

                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });

    var setRegion = new google.maps.Polyline({
        path: decodedPath,
        strokeColor: "#0090ff",
        strokeOpacity: 1.0,
        fillColor: '#4cb1ff',
        fillOpacity: 1,
        strokeWeight: 5,
        map: map
    });
    var cityCircle=[];
    for (var i=0;i<info.pick.length;i++) {

        cityCircle.push(new google.maps.Circle({
            strokeColor: '#000',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: '#fff',
            fillOpacity: 1,
            map: map,
            center: {lat: info.pick[i]["lat"], lng: info.pick[i]["lng"]},
            radius: (25)
        }));
    }

    map.addListener('zoom_changed', function(e) {

        return;
        for (var i = 0; i < cityCircle.length; i++) {

            cityCircle[i].setMap(null);
        }

        cityCircle = [];
        setTimeout(function () {

            for (var i = 0; i < info.pick.length; i++) {

                cityCircle.push(new google.maps.Circle({
                    strokeColor: '#000',
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    fillColor: '#fff',
                    fillOpacity: 1,
                    map: map,
                    center: {lat: info.pick[i]["lat"], lng: info.pick[i]["lng"]},
                    radius: ((25 * 15) / map.getZoom())
                }));
            }

        }, 3000);

    });
}

var screenHeight = 100;
var stage = 1;
(function(){
    var screen = window.location.hash;
    if(screen == ''){
        stage = 1;
    }
    else{
        if(screen.indexOf('#stage') != -1)
        {
            var screenArr = screen.split('#stage');
            if(screenArr.length > 2){
                stage = 1;
            }else{
                if(screenArr[1] < 6){
                    stage = 1;
                }else{
                    stage = Number(screenArr[1]);
                    // make ajax call to fetch data;
                }
            }
        }else{
            stage = 1;
        }
    }

    window.location.hash = 'stage'+stage;
    var handle = $('.screenWrapper');
    createScreenBox(handle, 'append', 0);
})();

function setCarousel(){

    /*
     jQuery(".item").eq(morningSlot).addClass("active");
     $('#mycarousel').carousel({
     interval: false,
     wrap: false
     });
     $('#mycarousel .item').each(function(){
     var next = $(this).next();
     if (!next.length) {
     next = $(this).siblings(':first');
     }
     next.children(':first-child').clone().appendTo($(this));

     if (next.next().length>0) {
     next.next().children(':first-child').clone().appendTo($(this));
     }
     else {
     $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
     }
     });
     */

    $('.carousel-inner').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3
    });

// for every slide in carousel, copy the next slide's item in the slide.
// Do the same for the next, next item.
    /*
     var wd = $('.carousel').width();
     var wd2 = 2*($('.leftbtn')[0].offsetWidth);
     wd = wd-wd2-10;
     var bw = $('.btnTime').length*104;
     if(wd > bw){
     wd = bw;
     }
     $('.btnsWrapper').css('width', wd+'px');
     $('.btnsWrapper .btns').css('width', bw+'px');

     $('.leftbtn').on('click', function(){
     var btw = ($('.btnsWrapper .btns').width()/2)-104;
     var lt = $('.btnsWrapper .btns').css('left');
     lt = lt.replace('px','');
     lt = Number(lt);
     lt = lt-(104);
     console.log(lt,btw);
     if(Math.abs(lt) <= btw){
     $('.btnsWrapper .btns').css('left', lt+'px');
     }
     });

     $('.rightbtn').on('click', function(){
     var lt = $('.btnsWrapper .btns').css('left');
     lt = lt.replace('px','');
     lt = Number(lt);
     lt = lt+(104);
     var wd = ($('.btnsWrapper .btns')[0].offsetWidth);
     if(lt <= 0){
     $('.btnsWrapper .btns').css('left', lt+'px');
     }
     });
     */
}

function setCarousel2() {

    $('.carousel-inner').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3,
        initialSlide:0,
        swipeToSlide:true
    });
    $('.carousel-inner')
}


function hideAddressBar(){
    setTimeout(function(){
        // Hide the address bar!
        window.scrollTo(0, 1);
    }, 0);
}

window.addEventListener("load",function() {
    // Set a timeout...
    setTimeout(function(){
        // Hide the address bar!
        window.scrollTo(0, 1);
    }, 0);
});

$(function() {
    //screenHeight = screen.availHeight-50;
    screenHeight = window.innerHeight;
    var height = $('.header')[0].offsetHeight;
    screenHeight = screenHeight-height;
    setHeight();
    $('.screenWrapper').css('height', screenHeight+'px');
});

function setHeight(){
    //$('.screen').css('min-height', screenHeight+'px');
}

$('input[type="text"]').on('input', function(){
    if($(this).val().length > 0){
        $(this).next('.remove').css('display', 'table-cell');
    }else{
        $(this).next('.remove').css('display', 'none');
    }
});

$('.remove').on('click', function(){
    $(this).css('display', 'none').prev('input[type="text"]').val('');
    if (info.homeAddress){
        info.homeAddress = undefined;

    }
    else
        info.officeAddress = undefined;
});

function nextPrevVlickEvents(){
    $('.fa-angle-double-down, .nextBtnMap').on('click', function(){

        if (stage==9) {
            if (!info.phone_number || !info.is_mobile_verified) {
                jQuery('#phoneModal').modal("show");
                return;
            }
            if (info.route_type=="Live_route"){
                
            changeToStage(6);
            return;
            }else{
                
                changeToStage(10);
                return;
        }
        }

        refer.stage = stage;
        refer.click = 'down';
        stage++;
        if(stage > 14){stage = 14};
        window.location.hash = 'stage'+stage;
        $(this).closest('.screen').outerHeight();
        var handle = $(this).closest('.screen');
        var px = $(handle).outerHeight();
        var newHandle = createScreenBox(handle, 'after', px);
        setHeight();
        $(handle).css('top','-'+px+'px')
        setTimeout(function(){
            $(newHandle).css('top','0');
        },0);
        setTimeout(function(){
            $(handle).remove();
        },300);
    });

    $('.fa-angle-double-up, .backBtnMap').on('click', function(){
        refer.stage = stage;
        refer.click = 'up';
        stage--;
        if(stage < 1){stage = 1};
        window.location.hash = 'stage'+stage;
        $(this).closest('.screen').outerHeight();
        var handle = $(this).closest('.screen');
        var px = $(handle).outerHeight();
        var newHandle = createScreenBox(handle, 'before', '-'+px);
        setHeight();
        $(handle).css('top',px+'px')
        setTimeout(function(){
            $(newHandle).css('top','0');
        },0);
        setTimeout(function(){
            $(handle).remove();
        },300);
        if(stage == 1){
            initAutocomplete();
        }
    });

    $('.submitsurvey').on('click', function(){
        $('#phoneModal').modal('show');
    });
}

var interval;
function validatePhone(){
    var inputtxt = info.phone_number;
    var phoneno = /^\d{10}$/;
    if(inputtxt.match(phoneno)) {
        $('#phoneModal .error').html('').hide();
        $('.loader').fadeIn();
        showLoader();
        $.ajax({
            url : 'sendOtp?phoneNumber='+inputtxt,
            type : 'GET',
            dataType : 'json',
            contentType : "application/json; charset=utf-8",
            header : 'x-requested-with'
        })
            .done(function(result){

                hideLoader();
                $('.loader').fadeOut();
                if(result.success){

                    jQuery("#phoneModal #userPhoneNumber").hide();
                    jQuery("#phoneModal .otp-entry").show();

                }else{
                    $('#phoneModal .error').html('invalid mobile number').fadeIn();
                }
            })
            .fail(function(err){
                $('.loader').fadeOut();
                $('#phoneModal .error').html('invalid mobile number').fadeIn();
            });
    }else {
        $('#phoneModal .error').html('invalid mobile number').fadeIn();
        return false;
    }
}
var tries=0;
function validateMobileInput(num){
    tries++;

    info.phone_number=num;
    $.ajax({
        url : 'verifyPhoneCall?phone_number='+num+"&try="+tries,
        type : 'GET',
        dataType : 'json',
        contentType : "application/json; charset=utf-8",
        header : 'x-requested-with'
    })
        .done(function(result){
            if(result.success){
                if (result.is_done==0 && tries<50){

                    return;
                }

                if (result.is_done==0){
                    $('#phoneModal .error').html('Please try again.Verification Failed').fadeIn();
                    clearInterval(interval);
                    return;
                }
                clearInterval(interval);
                info["is_mobile_verified"]=true;
                if (stage==5){

                    if (jQuery("#share_heading")!=undefined) {
                        jQuery('#share_heading').html("Congratulations!! You have successfully made");
                    }

                }else if (stage==10){

                    if (paymentFlow==1) {
                        onForPaymentMobileVerified();
                    }

                }else if (stage==11){


                    if (!info.is_mobile_verified) {
                        alert("Thank you for suggestion.Your number is verfied");
                        jQuery('#route_live').html("Hey!! Your routes are almost live");
                    }
                }
            }else{
                $('#phoneModal .error').html('invalid mobile number').fadeIn();
                clearInterval(interval);
            }
        })
        .fail(function(err){
            $('#phoneModal .error').html(err).fadeIn();
            clearInterval(interval);
        });
}

function onMobileVerified(num){

    info["is_mobile_verified"]=true;

    if (stage==9) {
        submitDataToServer();
    }
    $('.loader').fadeOut();
    $('#phoneModal').modal('hide');
    refer.stage = stage;
    refer.click = 'down';
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1){
    //removing notification process if its iphone
        if (stage==9){

            if (info.route_type=="Live_route"){

                stage=6;
            }else {
                stage = 10;
            }
        }else{
            
            stage=5;
        }

        //this code should be removed after we finalize this flow
       /*
        if (stage==10) {
            if (paymentFlow==1){

                onForPaymentMobileVerified(info.phone_number);
                return;
            }else {
                stage = 11;
            }
        }else{

            stage=5;
        }
        */
    }
    else {

        if (stage==9){

            if (info.route_type=="Live_route"){

                stage=6;
            }else {
                stage = 10;
            }
        }else{

            stage=15;
        }


        //this code should be removed after we finalize this flow
        /*
        if (paymentFlow==1 && stage==10){

            onForPaymentMobileVerified(info.phone_number);
            return;
        }else {
            stage = 15;
        }
        */
    }
    window.location.hash = 'stage'+stage;
    $('.screen').outerHeight();
    var handle = $('.screen');
    var px = $(handle).outerHeight();
    var newHandle = createScreenBox(handle, 'after', px);
    setHeight();
    $(handle).css('top','-'+px+'px')
    setTimeout(function(){
        $(newHandle).css('top','0');
    },0);
    setTimeout(function(){
        $(handle).remove();
    },300);
}

function notInterested(){
    $('.bounce, .bouncebtn').on('click', function(){
        stage = 14;
        window.location.hash = 'stage'+stage;
        var handle = $('.screenWrapper').find('.screen');
        var px = $(handle).outerHeight();
        var newHandle = createScreenBox(handle, 'after', px);
        setHeight();
        $(handle).css('top','-'+px+'px')
        setTimeout(function(){
            $(newHandle).css('top','0');
        },0);
        setTimeout(function(){
            $(handle).remove();
        },300);
    });
}
notInterested();

function choosePass(passType){
    info.pass_type=passType;
    jQuery(".shuttl-pass").removeClass("selected");

    jQuery(".passtype_"+passType).addClass("selected");


}

function timeCapture(){
    jQuery(document).off(".timecapture");
    $(document).on('click.timecapture','.reachwork button, .leavework button, .commutework button, .btnTime', function(){
        var obj = $(this);
        var type = $(obj).closest('.btn-group-justified').attr('data-roletype');
        if($(obj).hasClass('btn-default')){
            $(obj).removeClass('btn-default').addClass('btn-info');
            var value = $(obj).attr('data-value');
            if(type == 'reachwork'){
                var index;
                if(info.reachwork === undefined){
                    info.reachwork = []
                }
                info.reachwork.push(value);
                $.unique(info.reachwork);
                if($(obj).hasClass('btnTime')){
                    if(info.reachwork.length > 1){
                        $(obj).closest('.btn-group-justified').find('button[data-value="'+info.reachwork[0]+'"]').addClass('btn-default').removeClass('btn-info');
                        info.reachwork.splice(0, 1);
                    }
                }else{
                    if(info.reachwork.length > 2){
                        $(obj).closest('.btn-group-justified').find('button[data-value="'+info.reachwork[1]+'"]').addClass('btn-default').removeClass('btn-info');
                        info.reachwork.splice(1, 1);
                    }
                }
            }else if(type == 'leavework'){
                if(info.leavework === undefined){
                    info.leavework = []
                }
                info.leavework.push(value);
                $.unique(info.leavework);
                if($(obj).hasClass('btnTime')) {
                    if (info.leavework.length > 1) {
                        $(obj).closest('.btn-group-justified').find('button[data-value="' + info.leavework[0] + '"]').addClass('btn-default').removeClass('btn-info');
                        info.leavework.splice(0, 1);
                    }
                }else{
                    if(info.leavework.length > 2){
                        $(obj).closest('.btn-group-justified').find('button[data-value="'+info.leavework[1]+'"]').addClass('btn-default').removeClass('btn-info');
                        info.leavework.splice(1, 1);
                    }
                }
            }else if(type == 'commutework'){
                if(info.commutework === undefined){
                    info.commutework = []
                }
                info.commutework.push(value);
            }
        }else{
            $(obj).addClass('btn-default').removeClass('btn-info');
            var value = $(obj).attr('data-value');
            var index;
            if(type == 'reachwork'){
                index = info.reachwork.indexOf(value);
                info.reachwork.splice(index,1);
            }else if(type == 'leavework'){
                index = info.leavework.indexOf(value);
                info.leavework.splice(index,1);
            }else if(type == 'commutework'){
                index = info.commutework.indexOf(value);
                info.commutework.splice(index,1);
            }
        }

        var arrLength;
        if(type == 'reachwork'){
            arrLength = info.reachwork;
            if(arrLength.length == 2){
                $('.downArr .fa-angle-double-down').trigger('click');
            }
        }else if(type == 'leavework'){
            arrLength = info.leavework;
            if(arrLength.length == 2){
                $('.downArr .fa-angle-double-down').trigger('click');
            }
        }else if(type == 'commutework'){
            arrLength = info.commutework;
            $('.downArr').fadeIn();
            $('.bounce').hide();
        }
    });
}

function routeSummary(){
    refer.stage = 5;
    refer.click = 'up';
    info.stageone = 'complete';
    $('.routeHeading').on('click', function(){
        stage = 1;
        window.location.hash = 'stage'+stage;
        $(this).closest('.screen').outerHeight();
        var handle = $(this).closest('.screen');
        var px = $(handle).outerHeight();
        var newHandle = createScreenBox(handle, 'before', '-'+px);
        setHeight();
        $(handle).css('top',px+'px')
        setTimeout(function(){
            $(newHandle).css('top','0');
        },0);
        setTimeout(function(){
            $(handle).remove();
        },300);
        initAutocomplete();
    });

    $('.mslots').on('click', function(){
        stage = 2;
        window.location.hash = 'stage'+stage;
        $(this).closest('.screen').outerHeight();
        var handle = $(this).closest('.screen');
        var px = $(handle).outerHeight();
        var newHandle = createScreenBox(handle, 'before', '-'+px);
        setHeight();
        $(handle).css('top',px+'px')
        setTimeout(function(){
            $(newHandle).css('top','0');
        },0);
        setTimeout(function(){
            $(handle).remove();
        },300);
    });

    $('.eslots').on('click', function(){
        stage = 3;
        window.location.hash = 'stage'+stage;
        $(this).closest('.screen').outerHeight();
        var handle = $(this).closest('.screen');
        var px = $(handle).outerHeight();
        var newHandle = createScreenBox(handle, 'before', '-'+px);
        setHeight();
        $(handle).css('top',px+'px')
        setTimeout(function(){
            $(newHandle).css('top','0');
        },0);
        setTimeout(function(){
            $(handle).remove();
        },300);
    });
}

function createScreenBox(handle, position,px){
    var screen = document.createElement('div');
    screen.setAttribute('class', 'screen');
    screen.setAttribute('style', 'top:'+px+'px');
    if(position == 'append'){
        $(handle).append(screen);
    }else if(position == 'after'){
        $(handle).after(screen);
    }else if(position == 'before'){
        $(handle).before(screen);
    }
    switchScreen(stage, screen);
    return screen;
}

function switchScreen(scrno, obj){
    ga('send', 'event', 'screen_no', scrno);
    switch(scrno){
        case 1:

            var html = '<div class="headText text-center"> For daily pickup and drop from <br> Home to Office <span class="highlight"><br/>#MakeYourOwnRoute</span></div>';
            html += '<div class="col-md-12 homeL"><br /><br />';
            html += '<div class="form-group form-group-wrapper">';
            html += '<div class="input-group">';
            html += '<div class="input-group-addon"><span class="fa fa-home"></span></div>';
            html += '<input type="text" class="form-control loc" onfocus="inpclicked(this);" onblur="inpremoved(this);" name="homeLocation" id="homeLocation" placeholder="Enter Home Address" autocomplete="off" />';
            html += '<div class="input-group-addon remove"><span class="fa fa-remove"></span></div>';
            html += '</div></div></div>';


            html += '<br /><h4 class="text-center">AND</h4><br />';

            html += '<div class="col-md-12 officeL">';
            html += '<div class="form-group form-group-wrapper">';
            html += '<div class="input-group">';
            html += '<div class="input-group-addon"><span class="fa fa-suitcase"></span></div>';
            html += '<input type="text" class="form-control loc" onfocus="inpclicked(this);" onblur="inpremoved(this);" name="officeLocation" id="officeLocation" placeholder="Enter Office Address" autocomplete="off" />';
            html += '<div class="input-group-addon remove"><span class="fa fa-remove"></span></div>';
            html += '</div></div></div>';
            html += '<img style="height:92px" class="slide-right" src="../images/right_slide_icon.png" alt="button">';
            html += '<div class="downArr dowfirst"><span class="fa fa-angle-double-down"></span></div>';
            html += aboutUs();
            html += '<div id = "grey-screen"> </div>';
            $(obj).html(html)
                .find('.downArr').hide();

            //aboutUsSlider

            $(document).click(function toggleAboutUs() {

                if ($('#aboutUsOverlay').is(':visible'))
                {
                        $('#aboutUsOverlay, #grey-screen').hide();
                    
                    
                }


            });

            $('.slide-right').click(function(e){
                e.stopPropagation();
                $('#aboutUsOverlay, #grey-screen').show();
            });



           
            if(refer.hasOwnProperty('click')){
                if(refer.stage >= 1){
                    $(obj).find('.downArr').fadeIn().end()
                        .find('#homeLocation').val(info.homeName).end()
                        .find('#officeLocation').val(info.officeName);
                }
            }
            break;

        case 2:
            var html = '<div class="upArr"><span class="fa fa-angle-double-up"></span></div>';
            html += '<div class="headText headText2 text-center">You have selected to travel from </div>';
            html += '<div class="headText headText2 text-center" style="color:#3c5daa">' + info.homeName + ' to ' + info.officeName +' </div> <br><br>';
            html += '<div class="headText headText2 text-center"> Please tell us what time you\'d like to <span class="highlight lesshighlight"><br/>#ReachWork</span></div>';
            html += '<div class="col-md-12"><br /><br />';
            html += '<div class="btn-group btn-group-justified reachwork" role="group" data-roletype="reachwork">';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="8:00">8:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="8:30">8:30</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="9:00">9:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="9:30">9:30</button>';
            html += '</div></div></div>';
            html += '<div class="col-md-12">&nbsp;</div>';
            html += '<div class="col-md-12">';
            html += '<div class="btn-group btn-group-justified reachwork" role="group" data-roletype="reachwork">';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="10:00">10:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="10:30">10:30</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="11:00">11:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="11:30">11:30</button>';
            html += '</div></div></div>';
            html += '<br/><h6 class="text-center">( select top 2 )</h6>';
            html += '<div class="downArr"><span class="fa fa-angle-double-down"></span></div>';
            $(obj).html(html)
                .find('.downArr').hide().end()
                .find('.upArr').hide();
            if(refer.hasOwnProperty('click')){
                if(refer.stage >= 1){
                    $(obj).find('.upArr').fadeIn();
                }
                if(info.reachwork != undefined){
                    $(obj).find('.downArr').fadeIn();
                }
            }
            if(info.reachwork != undefined){
                $.each(info.reachwork, function(key, value){
                    $(obj).find('button[data-value = "'+value+'"]').removeClass('btn-default').addClass('btn-info');
                });
            }
            timeCapture();
            break;

        case 3:
            var html = '<div class="upArr"><span class="fa fa-angle-double-up"></span></div>';
            html += '<div class="headText headText2 text-center">And also, what time you <span class="highlight lesshighlight"><br/>#LeaveFromWork</span></div>';
            html += '<div class="col-md-12"><br /><br />';
            html += '<div class="btn-group btn-group-justified leavework" role="group" data-roletype="leavework">';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="17:00">17:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="17:30">17:30</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="18:00">18:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="18:30">18:30</button>';
            html += '</div></div></div>';
            html += '<div class="col-md-12">&nbsp;</div>';
            html += '<div class="col-md-12">';
            html += '<div class="btn-group btn-group-justified leavework" role="group" data-roletype="leavework">';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="19:00">19:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="19:30">19:30</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="20:00">20:00</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="20:30">20:30</button>';
            html += '</div></div></div>';
            html += '<br/><h6 class="text-center">( select top 2 )</h6>';
            html += '<div class="downArr"><span class="fa fa-angle-double-down"></span></div>';
            $(obj).html(html)
                .find('.downArr').hide().end()
                .find('.upArr').hide();
            if(refer.hasOwnProperty('click')){
                if(refer.stage >= 2){
                    $(obj).find('.upArr').fadeIn();
                }
                if(info.leavework != undefined){
                    $(obj).find('.downArr').fadeIn();
                }
            }

            if(info.leavework != undefined){
                $.each(info.leavework, function(key, value){
                    $(obj).find('button[data-value = "'+value+'"]').removeClass('btn-default').addClass('btn-info');
                });
            }

            timeCapture();
            break;

        case 4:
            var html = '<div class="upArr"><span class="fa fa-angle-double-up"></span></div>';
            html += '<div class="headText headText3 text-center">Oh wait!! We almost forgot to ask how you <span class="highlight lesshighlight"><br/>#TravelToWork</span></div>';
            html += '<div class="col-md-12"><br />';
            html += '<div class="btn-group btn-group-justified commutework" role="group" data-roletype="commutework">';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="bus">Bus</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="metro">Metro</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="auto">Auto</button>';
            html += '</div></div></div>';
            html += '<div class="col-md-12">&nbsp;</div>';
            html += '<div class="col-md-12">';
            html += '<div class="btn-group btn-group-justified commutework" role="group" data-roletype="commutework">';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="taxi">Taxi</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="car">Car</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="bike">Bike</button>';
            html += '</div></div></div>';
            html += '<div class="col-md-12">&nbsp;</div>';
            html += '<div class="col-md-12">';
            html += '<div class="btn-group btn-group-justified commutework" role="group" data-roletype="commutework">';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="shared-auto">Shared Auto</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="shared-taxi">Shared Taxi</button>';
            html += '</div>';
            html += '<div class="btn-group" role="group">';
            html += '<button type="button" class="btn btn-default" data-value="office-cab">Office Cab</button>';
            html += '</div></div></div>';
            html += '<br/><h6 class="text-center">( select all modes that you use )</h6>';
            html += '<div class="downArr submit-butt"><div class="row col-md-12"><span class="btn btn-primary submitsurvey text-uppercase col-md-12 text-center">Submit</span></div></div>';
            html += '<div class="modal fade bs-example-modal-sm" role="dialog" id="phoneModal">';
            html += '<div class="modal-dialog modal-sm">';
            html += '<div class="modal-content">';
            html += '<div class="modal-body text-center"><input class="col-md-12" type="number" placeholder="Enter mobile no." maxlength="10" id="userPhoneNumber" onKeyup="onPhoneNumberEntered();" /><p class="error"></p><div class="loader"><em>Sending Otp</em><img style="display:none;" src="/images/rolling.gif" /></div><div class="bounce">I\'m not interested</div></div>';
            html+='<div class="otp-entry" style="display: none;"><input type="number" class="col-md-12" placeholder="enter otp" maxlength="5" id="otp" onkeyup="otpentered(this)"/>';
            html+='<div><button class="btn-primary" onclick="validatePhone();">Resend Otp</button><button class="btn-primary" onclick="changePhoneNumber();">Change Number</button></div></div>';
            html += '</div></div></div>';
            $('#phoneModal .error').html('').hide();
            $("div.notInterested").hide();
            $(obj).html(html)
                .find('.downArr').hide().end()
                .find('.upArr').hide();
            if(refer.hasOwnProperty('click')){
                if(refer.stage >= 3){
                    $(obj).find('.upArr').fadeIn();
                }
                if(info.commutework != undefined){
                    $(obj).find('.downArr').fadeIn();
                }
            }

            info.route_type="new";
            if(info.commutework != undefined){
                $.each(info.commutework, function(key, value){
                    $(obj).find('button[data-value = "'+value+'"]').removeClass('btn-default').addClass('btn-info');
                });
            }
            notInterested();
            timeCapture();
            break;

        case 5:
            var html = '<div class="col-md-12 text-center" style="height: 100%;position: static;">';
            html += '<h4 style="margin:0;" id="share_heading" class="text-center sharetext">Congratulations!! You have successfully made</h4><br />';
            html += '<fieldset>';
            html += '<legend>#YourRoute</legend>';
            html += '<div class="col-md-12 routeHeading text-capitalize">';
            html += '<div class="routeCreated"><span class="home">'+info.homeAddressShortened+'</span> <> <span class="office">'+info.officeAddressShortened+'</span></div>';
            html += '</div>';
            html += '<div class="col-md-12 slotRow ">';
            html += '<span class="slotHeading">Morning Slots: </span>';
            html += '<span class="mslots"><span class="slots">8:00 AM</span> & <span class="slots">10:00 AM</span></span>';
            html += '</div>';
            html += '<div class="col-md-12 slotRow">';
            html += '<span class="slotHeading">Evening Slots : </span>';
            html += '<span class="eslots"><span class="slots">6:00 PM</span> & <span class="slots">7:00 PM</span></span>';
            html += '</div>';
            html += '<h6 class="text-center">( Click above to change info )</h6>';
            html += '</fieldset>';
            html += '<p class="routeCount"><span class="count">3</span> Other people have made same route</p><br/>';
            html += '<div class="headText headText3 text-center">To launch the route sooner <span class="highlight">#KeepSpreadingTheWord</span></div>';
            html += '<div class="row social">';
            html += '<div class="col-md-12">';
            /*html += '<span class="fa fa-google-plus col-md-3"></span>';*/
            /*html += '<span class="fa fa-facebook col-md-3"></span>';
             html += '<span class="fa fa-linkedin col-md-3"></span>';
             */
            /*html += '<a class="fa-social" id="whatsapp" onclick="sendWhatsApp();"><span class="fa fa-whatsapp col-md-3"></span></a>';*/
            html += '<a class="fa-social" id="whatsapp" onclick="sendWhatsApp();"><span class="full" style="padding:13px;display:table;">Share Via WhatsApp</span></a>';
            html += '</div></div></div>';

            var mSlots = '';
            var emp = '';
            if(info.reachwork != undefined){
                $.each(info.reachwork, function(key, value){
                    if(key != info.reachwork.length-1){
                        emp = ' & ';
                    }else{
                        emp = '';
                    }
                    mSlots += '<span class="slots">'+value+'</span>'+emp;
                });
            }
            var eSlots = '';

            if (!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) {
                if (window.Notification) {
                info.pushSubscriptionStatus = window.Notification.permission;
                ga('send', 'event', 'chromeNotificationStatus',window.Notification.permission);
            }else{

                    info.pushSubscriptionStatus="weird_browser";
                }
                }else{

                info.pushSubscriptionStatus="safari_notpresent";
            }
            if(info.leavework != undefined){
                $.each(info.leavework, function(key, value){
                    if(key != info.leavework.length-1){
                        emp = ' & ';
                    }else{
                        emp = '';
                    }
                    eSlots += '<span class="slots">'+value+'</span>'+emp;
                });
            }


            var topPx = $('.screenWrapper').css('height');
            topPx = topPx.replace('px', '');
            topPx = Number(topPx)-100;
            $(obj).html(html)
                .find('.home').html(info.homeAddressShortened).end()
                .find('.office').html(info.officeAddressShortened).end()
                .find('.office').html(info.officeAddressShortened).end()
                .find('.mslots').html(mSlots).end()
                .find('.eslots').html(eSlots).end()
                .find('.social').css('top',topPx).end();

            jQuery('.bounce').css("display","none");
            routeSummary();
            if (info.is_mobile_verified){


                jQuery(obj).find("#share_heading").html("We'll contact you when the route is ready for launch");
            }
            if (info.homeAddress!=undefined && info.officeAddress!=undefined){

                fillWhatsAppLink();
            }
            submitDataToServer();
            break;


        case 6:
            var html = '<div class="col-md-12 text-center fullheight">';
            html += '<span class="headText headText4 text-center bold">Route summary</span>';
            html+='<div class="route_price_ticket" >Distance:<b>&nbsp;'+parseInt(info.distance/1000)+' KM</b>&nbsp;&nbsp;|&nbsp;&nbsp;One-Way Price:&nbsp;<b>Rs '+info.pricing[0][2]+'</b></div>';
            html += '<fieldset class="pay">';
            html += '<div class="box-payment">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Going To Work</span>';
            html += '<span class="change" onclick="goToReachWorkScreen(this);">change</span>';
            html += '</div>';
            html += '<div class="routeinfoPayment">' + routeDetailsToWork("departure")+'</div>';
            html += '<div class="routeinfoPayment">' + routeDetailsToWork("arrival")+ '</div>';
            html += '<div class="fillingfast" style="display:none;">8 more ppl required to launch route</div>';
            html += '</div>';

            html += '<div class="box-payment">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Return From Work</span>';
            html += '<span class="change"  onclick="goToLeaveWorkScreen(this);">change</span>';
            html += '</div>';
            html += '<div class="routeinfoPayment">'+ routeDetailsFromWork("departure") +'</div>';
            html += '<div class="routeinfoPayment">'+ routeDetailsFromWork("arrival")+'</div>';
            html += '<div class="fillingfast" style="display:none;">4 more ppl required to launch route</div>';
            html += '</div>';

            html += '</fieldset>';
            html += '<div style="margin-top: 5%">';
            html += '<div> Would you like an <b> AC Ride </b> from home to office? </div></div>';
            html += '<a class="google-play-button" href="https://play.google.com/store/apps/details?id=app.goplus.in.myapplication&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"><img class="google-play-button" alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png"/></a>';
            html += '<a class="app-store-button" href="https://itunes.apple.com/in/app/shuttl-cool-smart-bus/id1043422614?mt=8" ><img class= "google-play-button" src=../images/app-store.svg></a>'
            html += '</div>';
            $(obj).html(html);

            if (getMobileOperatingSystem()=='iOS')
                $(".app-store-button").show();
            else
                $(".google-play-button").show();

            break;

        case 7:
            var html = '<div class="col-md-12 text-center fullheight">';
            html += '<h3 style="margin:0;" class="text-center" id="route_live">Payment successful</h3><br />';
            html+='<span style="margin-bottom: 14px;" class="">We will contact you when the route is live</span>';
            html += '<fieldset class="pay" style="padding-bottom: 0">';
            html += '<div class="box-payment">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Going To Work</span>';
            html += '</div>';
            html += '<div class="routeinfoPayment">' + routeDetailsToWork("departure")+'</div>';
            html += '<div class="routeinfoPayment">' + routeDetailsToWork("arrival")+ '</div>';
            html += '</div>';

            html += '<div class="box-payment">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Return From Work</span>';
            html += '</div>';
            html += '<div class="routeinfoPayment">'+ routeDetailsFromWork("departure") +'</div>';
            html += '<div class="routeinfoPayment">'+ routeDetailsFromWork("arrival")+'</div>';
            html += '</div>';
            html += '8 more days left to launch the route';
            html += '</fieldset>';
            html += '<div class="headText5 text-center bold" style="padding-top: 20px"> Earn Rs. 200 in Shuttl credits when your friends or colleagues buy a pass!</div>';
            html += '<div class="headText5 text-center"> Refer and earn now!  </div>';
            html += '<div class="row social" id="whatsapp" onclick="sendWhatsApp()">';
            html += '<div class="col-md-12">';
            html += '<span class="full" style="padding:20px;display:table;">Refer Via WhatsApp</span>';
            html += '</div></div></div>';
            $(obj).html(html);
            break;

        case 8:
            var html = '<div class="col-md-12 fullheight">';
            html += '<div class="fieldset">';
            html += '<div class="routeInfo1"><div class="flex"><span class="routePtName pick">' + info.homeName + '</span><span style="position:relative; top:-10px; background-color:white; margin-top:3px"> to </span> <span class="routePtName drop">'+ info.officeName+'</span></div></div>';
            html += '<span class="landmark"> (Landmark: Enter landmark here) </span>';
            html += '<div id="gMap"></div>';
            html += '<div class="flex" style="width:90%">';
            html += '<div class="mapMsg"><span class="seats"><span class="cur">180</span>/<span class="total">200</span></span><br> travellers confirmed </div>';
            html += '<div class="daysLeft"><span class="days">12</span><br>days to go live</div>';
            html += '</div></div>';
            html += '<div class="line2">To travel on this route, tell us</div>';
            html += '<div class="line2">What time do you have to <span class="bolder">reach</span> work?</div>';
            html += '<div class="carousel slide" id="mycarousel">';

            //html += '<span class="btnsWrapper">';
            html += '<div >';
            html += '<div class="carousel-inner btns btn-group-justified carousel-item-center" data-roletype="reachwork">';
            html += slotBtnsM;

            /* html += '<button type="button" class="btn btn-default btnTime" data-value="99:99">99:99<span class="live">(live)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="8:30">8:30</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:00">9:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:30">9:30<span class="live">(filling fast)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:00">10:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:30">10:30</button>'; */

            html += '</div></div>';
            //html += '<a class="left carousel-control" href="#mycarousel" role="button" data-slide-to=0 onClick=carouselSlide(this,"previous",morningSlot) > <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> <span class="sr-only">Previous</span></a>';
            // html += '<a class="right carousel-control" href="#mycarousel" role="button"  data-slide-to=0 onClick=carouselSlide(this,"next",morningSlot)> <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span> <span class="sr-only">Next</span></a>';
            //	html += '</span>';
            //html += '<span class="btn btn-default rightbtn">&gt;</span>';
            html += '</div>';
            html += '<div class="fillingfast">(leave blank if you don\'t wish to use shuttl in the morning)</div>';
            html += '<div class="text-capitalize btn btn-default col-xs-6 bouncebtn change-case-btn-left">not interested</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 nextBtnMap change-case-btn-right">next&gt;</div>';
            html += '</div>';
            $(obj).html(html);

            hideAddressBar();
            notInterested();

            $('.bounce').addClass('hidden');
            fw = true;
            setTimeout(function(){

                initMap(responseJson,"OTD");
                jQuery(".landmark").html((info.pick!=null && info.pick.length>0)?"(Landmark: "+info.pick[origin_index]["landmark"]+")":"");
                if ((info.pick!=null && info.pick.length>0)) {
                    jQuery(".routePtName.pick").html(info.pick[origin_index]["name"]);
                    jQuery(".routePtName.drop").html(info.pick[info.pick.length-1]["name"]);
                }
                if (info.reachwork!=undefined && info.reachwork.length>0){

                    jQuery(".item button").each(function(){

                        if (jQuery(this).attr("data-value")==info.reachwork[0]){

                            jQuery(this).removeClass("btn-default").addClass("btn-info");
                        }
                    });
                }

                timeCapture();
                setCarousel();
            },310);
            break;

        case 9:
            var html = '<div class="col-md-12 fullheight">';
            html += '<div class="fieldset">';
            html += '<div class="routeInfo1"><div class="flex"><span class="routePtName drop">' + info.officeName + '</span><span style="position:relative; top:-10px; background-color:white; margin-top:3px"> to </span> <span class="routePtName pick">'+ info.homeName+'</span></div></div>';
            html += '<div class="landmark"> '+(info.pick!=null && info.pick.length>0)?info.pick[info.pick.length-1]["landmark"]:""+' </div>';
            html += '<div id="gMap"></div>';
            html += '<div class="flex" style="width:90%">';
            html += '<div class="mapMsg"><span class="seats"><span class="cur">180</span>/<span class="total">200</span></span><br> travellers confirmed </div>';
            html += '<div class="daysLeft"><span class="days">12</span><br>days to go live</div>';
            html += '</div></div>';
            html += '<div class="line2">What time do you <span class="bolder">leave</span> from work?</div>';
            html += '<div class="carousel slide" id="mycarousel2">';

            //html += '<span class="btnsWrapper">';
            html += '<div>';
            html += '<div class="carousel-inner btns btn-group-justified carousel-item-center" data-roletype="leavework">';
            html += slotBtnsE;
            /*
             html += '<button type="button" class="btn btn-default btnTime" data-value="99:99">99:99<span class="live">(live)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="8:30">8:30</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:00">9:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:30">9:30<span class="live">(filling fast)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:00">10:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:30">10:30</button>';
             */

            html += '</div></div>';
            //    html += '<a class="left carousel-control" href="#mycarousel2" role="button" onClick=carouselSlide(this,"previous",eveningSlot) data-slide-to="0"> <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> <span class="sr-only">Previous</span></a>';
            //  html += '<a class="right carousel-control" href="#mycarousel2" role="button" onClick=carouselSlide(this,"next",eveningSlot) data-slide-to="0"> <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span> <span class="sr-only">Next</span></a>';
            //	html += '</span>';
            //html += '<span class="btn btn-default rightbtn">&gt;</span>';
            html += '</div>';
            html += '<div class="fillingfast">(leave blank if you don\'t wish to use shuttl in the evening)</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 backBtnMap change-case-btn-left">&lt;back</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 nextBtnMap change-case-btn-right">next&gt;</div>';
            html += '</div>';

            html += '<div class="modal fade bs-example-modal-sm" role="dialog" id="phoneModal">';
            html += '<div class="modal-dialog modal-sm">';
            html += '<div class="modal-content">';
            html += '<div class="modal-body text-center"><input class="col-md-12" type="number" placeholder="Enter mobile no." maxlength="10" id="userPhoneNumber" onKeyup="onPhoneNumberEntered();" /><p class="error"></p><div class="loader"><em>Sending Otp</em><img style="display:none;" src="/images/rolling.gif" /></div><div class="bounce">I\'m not interested</div></div>';
            html+='<div class="otp-entry" style="display: none;"><input type="number" class="col-md-12" placeholder="enter otp" maxlength="5" id="otp" onkeyup="otpentered(this)"/>';
            html+='<div><button class="btn-primary" onclick="validatePhone();">Resend Otp</button><button class="btn-primary" onclick="changePhoneNumber();">Change Number</button></div></div>';
            html += '</div></div></div>';
            $(obj).html(html);

            hideAddressBar();
            setTimeout(function () {


                if (info.leavework!=undefined && info.leavework.length>0){

                    jQuery(".item button").each(function(){

                        if (jQuery(this).attr("data-value")==info.leavework[0]){

                            jQuery(this).removeClass("btn-default").addClass("btn-info");
                        }
                    });
                }
                if ((info.pick!=null && info.pick.length>0)) {
                    jQuery(".routePtName.pick").html(info.pick[origin_index]["name"]);
                    jQuery(".routePtName.drop").html(info.pick[info.pick.length-1]["name"]);
                }
            },310);

            fw = false;
            $('.bounce').addClass('hidden');
            setTimeout(function(){
                initMap(responseJson,"DTO");

                setCarousel2();
                timeCapture();
            },310);
            break;

        case 10:
            var html = '<div class="col-md-12 text-center fullheight">';
            html += '<span class="headText headText4 text-center bold">Route summary</span>';
            html+='<div class="route_price_ticket" >Distance:<b>&nbsp;'+parseInt(info.distance/1000)+' KM</b>&nbsp;&nbsp;|&nbsp;&nbsp;One-Way Price:&nbsp;<b>Rs '+info.pricing[0][2]+'</b></div>';
            html += '<fieldset class="pay">';
            html += '<div class="box-payment">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Going To Work</span>';
            html += '<span class="change" onclick="goToReachWorkScreen(this);">change</span>';
            html += '</div>';
            html += '<div class="routeinfoPayment">' + routeDetailsToWork("departure")+'</div>';
            html += '<div class="routeinfoPayment">' + routeDetailsToWork("arrival")+ '</div>';
            html += '<div class="fillingfast" style="display:none;">8 more ppl required to launch route</div>';
            html += '</div>';

            html += '<div class="box-payment">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Return From Work</span>';
            html += '<span class="change"  onclick="goToLeaveWorkScreen(this);">change</span>';
            html += '</div>';
            html += '<div class="routeinfoPayment">'+ routeDetailsFromWork("departure") +'</div>';
            html += '<div class="routeinfoPayment">'+ routeDetailsFromWork("arrival")+'</div>';
            html += '<div class="fillingfast" style="display:none;">4 more ppl required to launch route</div>';
            html += '</div>';
            html += '</fieldset>';
            html += '<div class="headText headText4 text-center selecpasstext">Select a pass to travel on this route</div>';
            html += '<div class="item active selecpass">';
            html += '<button type="button" class="shuttl-pass text-capitalize paynow btn btn-default col-xs-6 setHeight centerVertical centerHorizontal passtype_1" onclick="choosePass(1);" data-value="1"><div>10 rides @ <span class="strike">'+info.pricing[0][0]+'</span><span class="offer_price">&nbsp;'+info.pricing[0][1]+'</span></div></button>';
            html += '<button type="button" class="shuttl-pass text-capitalize paynow btn btn-default col-xs-6 setHeight centerVertical centerHorizontal passtype_2" onclick="choosePass(2);" data-value="2"><div>20 rides @ <span class="strike">'+info.pricing[1][0]+'</span><span class="offer_price">&nbsp;'+info.pricing[1][1]+'</span></div></button></div>';
            html += '<div class="passinf selecpass">For more info <a onclick="showRoutePass();">click here</a></div>';
            html += '<div class="payTM-image row social">';
            html += '<div class="col-md-12" style="background-color: #3eb6b5;">';
            html += '<span class="full" style="padding:20px;display:table" onclick="initiatePaymentProcess()"><span class=" payTM-click-to-pay headText headText4 centerHorizontal" style="color: #fff !important;"> PAY USING </span><img style="padding-bottom:10px" src="../images/PayTM-Logo.png"> </span>';
            html += '</div></div>';
            html += '<div class="modal fade bs-example-modal-sm" role="dialog" id="phoneModal">';
            html += '<div class="modal-dialog modal-sm">';
            html += '<div class="modal-content">';
            html += '<div class="modal-body text-center"><input class="col-md-12" type="number" placeholder="Enter mobile no." maxlength="10" id="userPhoneNumber" onKeyup="onPhoneNumberEntered();" /><p class="error"></p><div class="loader"><em>Sending Otp</em><img style="display:none;" src="/images/rolling.gif" /></div><div class="bounce">I\'m not interested</div></div>';
            html+='<div class="otp-entry" style="display: none;"><input type="number" class="col-md-12" placeholder="enter otp" maxlength="5" id="otp" onkeyup="otpentered(this)"/>';
            html+='<div><button class="btn-primary" onclick="validatePhone();">Resend Otp</button><button class="btn-primary" onclick="changePhoneNumber();">Change Number</button></div></div>';
            html += '</div></div></div>';

            html+=getRoutePass();
            $(obj).html(html);
            $('.paynow').on('click', function(){
                var rs = $(this).attr('data-value');
            });

            if (getMobileOperatingSystem()=='iOS')
                $(".app-store-button").show();
            else
                $(".google-play-button").show();

            if (info.pricing[0][0]==1){

                jQuery(".selecpass").hide();
                jQuery(".selecpasstext").html("To travel on this route");
                jQuery(".payTM-click-to-pay").html(" Pay Re 1 Using ");
            }

            choosePass(1);
            break;

        case 11:
            // Google +
        var html ='<div class="col-md-12 text-center fullheight">';
        html += '<div class="share-incentive text-center"> Earn Rs. 200 in Shuttl credits when your friends or colleagues buy a pass! </div>';
        html += '<i class="search-icon glyphicon glyphicon-search"></i>';
        html += '<input id="search-google-contacts" datatype="search" class="search-box" placeholder="Find Contact by Name"> </input>';
        html += '<div> <div style="float:left"> 4/75 selected </div>';
        html += '<div class = select-all> select all <input id="checkAll" type="checkbox"> </div></div>';
        html += '<div class="friends-bar"> Friends </div>';
            // test entries.
            // delete the 14 lines below and call getContactHtml() in its place
            // remove comment from getContactHtml()
        html += '<ul id="google-contacts-list" class="google-contacts-list" data-role="listview" data-filter="true" data-input="#search-google-contacts">';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Harsh Poddar </div> <input type="checkbox" class="contact-checkbox" value="getValue()")></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Archit Raheja </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Rahul Amlekar </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Harsh Poddar </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Archit Raheja </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Rahul Amlekar </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Harsh Poddar </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Archit Raheja </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Rahul Amlekar </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Harsh Poddar </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Archit Raheja </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '<li class="contact-list"> <img class="contact-thumbnail" src=../images/shuttl_logo_square.png> <div class="google-contact-entry"> Rahul Amlekar </div> <input type="checkbox" class="contact-checkbox"></li>';
        html += '</ul>';
        html += '<div class="text-capitalize btn btn-primary col-xs-6 backBtnMap change-case-btn-left">&lt;Cancel</div>';
        html += '<div id="submit-google-contacts" onClick= "getSelectedContacts()" class="text-capitalize btn btn-primary col-xs-6 nextBtnMap change-case-btn-right">Submit&gt;</div>';
        $(obj).html(html);
            $("#checkAll").change(function () {
                $("input:checkbox").prop('checked', $(this).prop("checked"));
            });


            function getSelectedContacts() {
                var selectedContacts = [];
                var allContacts = getContacts();
                $("input:checkbox[name=type]:checked").each(function () {
                    var i = $(this).val();
                    selectedContacts[j].push = ({name: allContacts[i].name(),number: allContacts[i]});
                });

            }

            function getValue() {


            }


            /*function getContactHtml() {
                var html= '<ul data-role="listview" data-filter="true" data-input="#search-google-contacts">';
             var contacts = getContacts();
                for (var i=0; i<contacts.length; i++){
                    html += '<li class="contact-list"> <img class="contact-thumbnail" src=' + contacts[i].image +'><div class="google-contact-entry" > contacts[i].name </div><input type="checkbox" class="contact-checkbox" value=i></li>';
                }
                html += '</ul>';
                return html;
            }*/
            break;

        case 12:
            var html = '<div class="col-md-12 text-center fullheight">';
            html += '<h3 style="margin:0;" class="text-center" id="route_live">'+((info["payment_status"]==1)?"Payment Successful":"Payment Failed")+'</h3><br />';
            html+='<span style="margin-bottom: 14px;" class="">We will contact you when the route is live</span>';
            html += '<fieldset class="pay successpay">';
            html += '<legend class="payments"><span class="home">'+info.homeName+'</span> <> <span class="office">'+info.officeName+'</span></legend>';
            html += '<div class="box">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Going To Work</span>';
            //html += '<span class="change">change</span>';
            html += '</div>';
            html += '<div class="routeinfo">' + routeDetailsToWork("departure")+'</div>';
            html += '<div class="routeinfo">' + routeDetailsToWork("arrival")+ '</div>';
            html += '<div class="fillingfast" style="display:none;">8 more ppl required to launch route</div>';
            html += '</div>';

            html += '<div class="box">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Return From Work</span>';
            //html += '<span class="change">change</span>';
            html += '</div>';
            html += '<div class="routeinfo">'+ routeDetailsFromWork("departure") +'</div>';
            html += '<div class="routeinfo">'+ routeDetailsFromWork("arrival")+'</div>';
            html += '<div class="fillingfast" style="display:none;">4 more ppl required to launch route</div>';
            html += '</div>';

            html += '<div class="fillingfast">8 more days left to launch route</div>';

            html += '</fieldset>';
            html += '<div class="headText headText3 text-center">To launch the route sooner <span class="highlight">#KeepSpreadinTheWord</span></div>';
            html += '<div class="row social" id="whatsapp" onclick="sendWhatsApp()">';
            html += '<div class="col-md-12">';
            /*
             html += '<span class="fa fa-google-plus col-md-3"></span>';
             html += '<span class="fa fa-facebook col-md-3"></span>';
             html += '<span class="fa fa-linkedin col-md-3"></span>';
             html += '<span class="fa fa-whatsapp full"></span>';
             */
            html += '<span class="full" style="padding:20px;display:table;">Share Via WhatsApp</span>';
            html += '</div></div></div>';
            $(obj).html(html);
            fillWhatsAppLink();
            break;
        //offline sharing screen
        case 13:
            var html = '<div class="col-md-12">';
            html += '<div class="fieldset">';
            html += '<div class="routeInfo"><span class="ambassador routePtName">Become the Route Ambassador</span></div>';
            html += '<div class="promoMsg">Share your Promo Code: <em>4567</em> by sticking Customize poster\'s on your Home & Office notice boards';
            html += '<p class="extra">Earn Rs 25 Credit for every new customer on this route</p>';
            html += '</div>';
            html += '</div>';
            html += '<div class="confirmMsg">Confirm the below details to receive 3 <em>Posters</em> by mail within this week</div>';
            html += '<form>';
            html += '<div class="form-group">';
            html += '<input type="text" placeholder="full name" class="form-control" id="fullname"/>';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<input type="text" placeholder="address.." class="form-control" id="address"/>';
            html += '</div>';
            html += '<div class="text-capitalize btn btn-default col-xs-6 bouncebtn">cancel</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 submitaddress">submit</div>';
            html += '</form>';
            html += '</div>';
            $(obj).html(html);
            $('#address').val(info.homeAddressShortened);
            $('.bounce').remove();
            break;

        case 14:
            var html = '<div class="col-md-12">';
            html += '<h4>I am not interested in using Shuttl service because:</h4>';
            html += '<form>';
            html += '<div class="form-group">';
            html += '<textarea class="form-control" id="reason" placeholder="Type your reason..."></textarea>';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<button type="submit" class="btn btn-primary center-block">Submit</button>';
            html += '</div>';
            html += '</form>';
            html += '</div>';
            $(obj).html(html);
            $('.bounce').remove();
            break;

        case 15:
            var html ='<div class="col-md-12 text-center fullheight">';
            html += '<h4 style="margin:0;" class="text-center allow-notification">To track your Shuttl and its arrival at your doorstep please click on "Allow"</h4><br />';
            html += '';
            html+= '<div class="text-capitalize btn btn-default col-xs-12 bouncebtn submit-notification" onclick="changeToLastScreen();">submit</div>';
            html += '</div>';
            $(obj).html(html);

            // var urlBase = window.location.href;
            // if (urlBase.indexOf("://") > -1) {
            //     domain = urlBase.split('/')[2];
            // }
            // else {
            //     domain = urlBase.split('/')[0];
            // }

            if ('serviceWorker' in navigator) {
                console.log('Service Worker is supported');

                try{
                    navigator.serviceWorker.register('/sw.js').then(function () {
                        return navigator.serviceWorker.ready;
                    }).then(function (serviceWorkerRegistration) {
                        reg = serviceWorkerRegistration;
                        console.log('Service Worker is ready :^)', reg);
                        reg.pushManager.subscribe({userVisibleOnly: true}).then(function (pushSubscription) {
                            sub = pushSubscription;
                            console.log('Subscribed! Endpoint:', sub.endpoint);
                            info.subscriberID = sub.endpoint;
                            if (info.route_type=="new"){
                                changeToStage(5);
                            }else{

                                changeToStage(11);
                            }
                            //isSubscribed = true;
                        });
                    }).catch(function (error) {
                        console.log('Service Worker Error :^(', error);
                        if (info.route_type=="new"){
                            changeToStage(5);
                        }else{

                            changeToStage(11);
                        }
                    });
                }catch (error){

                    if (info.route_type=="new"){
                        changeToStage(5);
                    }else{

                        changeToStage(11);
                    }
                }
            }else{
                if (info.route_type=="new"){
                    changeToStage(5);
                }else{

                    changeToStage(11);
                }
            }

            // var trial=1;

            // initIzooto();
            // var notificationTimer = setInterval( function () {

            //     trial++;
            //     if (trial%20==0) {

            //         clearInterval(notificationTimer);
            //         changeToStage(5);
            //     }
            //     if (Notification.permission === 'granted' || Notification.permission === 'denied') {

            //         clearInterval(notificationTimer);

            //         ga('send', 'event', 'chromeNotificationStatus',Notification.permission);
            //         changeToStage(5);
            //     }else if (trial%10==0){
            //        // initIzooto();
            //     }
            // }, 500);
            break;

        case 16:
            var html = '<div class="col-md-12 text-center" style="height: 100%;position: static;">';
            html += '<h4 style="margin:0;" id="share_heading" class="text-center sharetext">"Congratulations!! You have successfully made"</h4><br />';
            html += '<fieldset>';
            html += '<legend>#YourRoute</legend>';
            html += '<div class="col-md-12 routeHeading text-capitalize">';
            html += '<div class="routeCreated"><span class="home">'+info.homeAddressShortened+'</span> <> <span class="office">'+info.officeAddressShortened+'</span></div>';
            html += '</div>';
            html += '<div class="col-md-12 slotRow ">';
            html += '<span class="slotHeading">Morning Slots: </span>';
            html += '<span class="mslots"><span class="slots">8:00 AM</span> & <span class="slots">10:00 AM</span></span>';
            html += '</div>';
            html += '<div class="col-md-12 slotRow">';
            html += '<span class="slotHeading">Evening Slots : </span>';
            html += '<span class="eslots"><span class="slots">6:00 PM</span> & <span class="slots">7:00 PM</span></span>';
            html += '</div>';
            html += '<h6 class="text-center">( Click above to change info )</h6>';
            html += '</fieldset>';
            html += '<p class="routeCount"><span class="count">3</span> Other people have made same route</p><br/>';
            html += '<div class="headText headText3 text-center">To launch the route sooner <span class="highlight">#KeepSpreadinTheWord</span></div>';
            html += '<div class="row social">';
            html += '<div class="col-md-12">';
            /*html += '<span class="fa fa-google-plus col-md-3"></span>';*/
            /*html += '<span class="fa fa-facebook col-md-3"></span>';
             html += '<span class="fa fa-linkedin col-md-3"></span>';
             */
            /*html += '<a class="fa-social" id="whatsapp" onclick="sendWhatsApp();"><span class="fa fa-whatsapp col-md-3"></span></a>';*/
            html += '<a class="fa-social" id="whatsapp" onclick="sendWhatsApp();"><span class="full" style="padding:13px;display:table;">Share Via WhatsApp</span></a>';
            html += '</div></div></div>';
            if (rideBooked && rideBooked == "success") {
                jQuery('#share_heading').html("Congratulations!! You have successfully made");
            }
            var mSlots = '';
            var emp = '';
            if(info.reachwork != undefined){
                $.each(info.reachwork, function(key, value){
                    if(key != info.reachwork.length-1){
                        emp = ' & ';
                    }else{
                        emp = '';
                    }
                    mSlots += '<span class="slots">'+value+'</span>'+emp;
                });
            }
            var eSlots = '';
            if(info.leavework != undefined){
                $.each(info.leavework, function(key, value){
                    if(key != info.leavework.length-1){
                        emp = ' & ';
                    }else{
                        emp = '';
                    }
                    eSlots += '<span class="slots">'+value+'</span>'+emp;
                });
            }


            var topPx = $('.screenWrapper').css('height');
            topPx = topPx.replace('px', '');
            topPx = Number(topPx)-100;
            $(obj).html(html)
                .find('.home').html(info.homeAddressShortened).end()
                .find('.office').html(info.officeAddressShortened).end()
                .find('.office').html(info.officeAddressShortened).end()
                .find('.mslots').html(mSlots).end()
                .find('.eslots').html(eSlots).end()
                .find('.social').css('top',topPx).end();

            jQuery('.bounce').css("display","none");
            routeSummary();
            if (info.homeAddress!=undefined && info.officeAddress!=undefined){

                fillWhatsAppLink();
            }
            break;


        case 17:
            var html = '<div class="col-md-12">';
            html += '<div class="fieldset">';
            html += '<div class="routeInfo"><span class="ambassador routePtName">Become the Route Ambassador</span></div>';
            html += '<p> Share your promo code:' + getOfflineSharePromoCode() + ' by sticking customized posters on your home and office notice boards</p>';
            html += '<div class="incentive"> Earn Rs. 25 credit for every new customer on this route</div>';
            html += '<div class="mapMsg"><span class="seats"><span class="cur">14</span>/<span class="total">20</span></span> travellers are confirmed</div>';
            html += '</div>';
            html += '<div class="promoDetails"> Confirm the below details to receive 3 posters by mail within the week</div>';
            html += '<form role="form">';
            html += '<div class="form-group">';
            // html += '<label for="full-name"> Full Name: </label>';
            html += '<input type="text" class="form-control" id="full-name" placeholder="Full name">';
            html += '</div>';
            html += '<div class="form-group">';
            // html += '<label for="email"> Email address: </label>';
            html += '<input type="email" class="form-control" id="email" placeholder="Email address">';
            html += '</div>';
            html += '<div class="form-group">';
            // html += '<label for="home-address"> Home Address: </label>';
            html += '<input readonly type="text" class="form-control" id="home-address" placeholder="Home address">';
            html += '</div>';
            html += '</form>';
            html += '<div class="text-capitalize btn btn-default col-xs-6 bouncebtn" style="position:fixed">Cancel</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 nextBtnMap" style="position:fixed">Submit&gt;</div>';
            html += '</div>';
            $(obj).html(html);
            break;

        default:
            window.location = '';

    }
    nextPrevVlickEvents();
    return true;
}

function   submitDataToServer(){
    $.ajax({
        url : 'saveNewSuggestion',
        method : 'POST',
        data:{data1:JSON.stringify(info)}
    })
        .done(function(result){

        })
        .fail(function(err){
        });
}

function changeMobileNo(){




}

function getGeoCodedAddress(latlng,callback){
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {

                callback(results[0]);
            } else {
            }
        } else {

        }
    });
}

function fillWhatsAppLink(){
    var poly = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1,
        strokeWeight: 3
    });


    var path=poly.getPath();
    path.push(new google.maps.LatLng(info.homelat,info.homelng));
    path.push(new google.maps.LatLng(info.officelat,info.officelng));
    var encodedPoints=google.maps.geometry.encoding.encodePath(path);


    jQuery('#whatsapp').attr("href_send","whatsapp://send?text="+"Start your shuttl at Rs 3/Km.Just log on to http://bus2work.in/suggest/index?paths="+encodedPoints+"&utm_source=whatsapp");

    jQuery.ajax({url:"/suggest/getWhatsAppShareLink?url="+"http://bus2work.in/suggest/index?paths="+encodedPoints}).done(function(result){

        var url=result["whatsapp_url"];
        jQuery('#whatsapp').attr("href_send","whatsapp://send?text=Start your shuttl at Rs 3/Km.Just log on to "+url);



    });

}
function sendWhatsApp(){

    var link=jQuery('#whatsapp').attr("href_send");
    ga('send', 'event', 'whatsappshare',link);
    setTimeout(function(){

        window.location.href=link;
    },1000);

}

function formatSectoIST(seconds){
    var hours   = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    var zone = '';
    if(hours > 12){
        hours -= 12;
        zone = 'PM';
    }else{
        zone = 'AM';
    }

    return pad(hours)+':'+pad(minutes)+' '+zone;
}
function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}


function fillAdministrativeLevelDetails(){

    var geocoder = new google.maps.Geocoder();

    if (info.homelat!=undefined && info.homelng!=undefined){

        var location={"lat":info.homelat,"lng":info.homelng};
        geocoder.geocode( { 'location': location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var subLocalityFound=false;
                if (results[0].address_components!=undefined && results[0].address_components.length>0){

                    for (var i=0;i<results[0].address_components.length;i++){

                        var types=results[0].address_components[i].types;
                        if (types!=undefined && types.length>0){

                            for (var j=0;j<types.length;j++){

                                if (results[0].address_components[i].types[j]=="sublocality_level_1"){


                                    info["homeAddressShortened"]=results[0].address_components[i].short_name;

                                    subLocalityFound=true;

                                }
                                if (results[0].address_components[i].types[j]=="administrative_area_level_2"){

                                    if (info["homeAddressShortened"]==undefined){

                                        info["homeAddressShortened"]=results[0].address_components[i].short_name;
                                    }else {
                                        info["homeAddressShortened"] = info["homeAddressShortened"]+","+results[0].address_components[i].short_name;
                                    }
                                    subLocalityFound=true;


                                }
                            }

                        }

                    }
                    if (!subLocalityFound){
                        info["homeAddressShortened"]=info.homeAddress;


                    }
                }


            } else {

                info["homeAddressShortened"]=info.homeAddress;

            }
            if (info.homeName==null){

                info["homeName"]=info.homeAddressShortened;
            }
        });
    }


    if (info.officelat!=undefined && info.officelng!=undefined){

        var location={"lat":info.officelat,"lng":info.officelng};
        geocoder.geocode( { 'location': location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var subLocalityFound=false;
                if (results[0].address_components!=undefined && results[0].address_components.length>0){

                    for (var i=0;i<results[0].address_components.length;i++){

                        var types=results[0].address_components[i].types;
                        if (types!=undefined && types.length>0){

                            for (var j=0;j<types.length;j++){

                                if (results[0].address_components[i].types[j]=="sublocality_level_1"){

                                    info["officeAddressShortened"]=results[0].address_components[i].short_name;
                                    subLocalityFound=true;
                                }
                                if (results[0].address_components[i].types[j]=="administrative_area_level_2"){

                                    if (info["officeAddressShortened"]==undefined){

                                        info["officeAddressShortened"]=results[0].address_components[i].short_name;

                                    }else{

                                        info["officeAddressShortened"]=info["officeAddressShortened"]+","+results[0].address_components[i].short_name;

                                    }

                                    subLocalityFound=true;
                                }

                            }
                        }
                    }
                    if (!subLocalityFound){
                        info["officeAddressShortened"]=info.officeAddress;

                    }
                }


            } else {

                info["officeAddressShortened"]=info.officeAddress;
            }
            if (info.officeName==null) {
                info["officeName"] = info.officeAddressShortened;
            }
        });
    }


}

function inpclicked(obj){

    if (jQuery(obj).attr("id")=="homeLocation"){

        jQuery(".screenWrapper").addClass("inputClicked_homeLocation");

    }else{

        jQuery(".screenWrapper").addClass("inputClicked_officeLocation");
    }


    jQuery('.bounce').hide();
    }

function inpremoved(){


    jQuery('.bounce').show();
    jQuery(".screenWrapper").removeClass("inputClicked_homeLocation");
    jQuery(".screenWrapper").removeClass("inputClicked_officeLocation");

}


function initiatePaymentProcess(){

    if (paymentFlow==1) {
        if (!info.is_mobile_verified) {
        jQuery('#phoneModal').modal("show");
    }else{

            onForPaymentMobileVerified(info.phone_number);
        }
        
        
    }else{

        changeToStage(11);
    }
}

function onForPaymentMobileVerified(phoneNumber){

    showLoader();
    jQuery("body").append("<form  method='post' action='/payment/makePayment' id='paymentForm'><input type='hidden' name='info' value='"+JSON.stringify(info)+"'></form>");
    jQuery("#paymentForm").submit();

}

function showLoader(){

    jQuery(".loader_wrapper").show();

}
function hideLoader(){

    jQuery(".loader_wrapper").hide();
}

function goToLeaveWorkScreen(obj){

    changeToStage(9);

}

function goToReachWorkScreen(obj){
   changeToStage(8);
}

function changeToStage(stageNo){


    stage = stageNo;
    window.location.hash = 'stage'+stage;
    var handle = $('.screenWrapper').find('.screen');
    var px = $(handle).outerHeight();
    var newHandle = createScreenBox(handle, 'after', px);
    setHeight();
    $(handle).css('top','-'+px+'px')
    setTimeout(function(){
        $(newHandle).css('top','0');
    },0);
    setTimeout(function(){
        $(handle).remove();
    },300);

}

function routeDetailsToWork(status){
    var routeSelected = (info.reachwork && info.reachwork[0] != null);
    if (routeSelected) {
        var rwork = info.reachwork[0];
        rwork = rwork.split(" ");
        var delta = 0;
        if (rwork[1] == "PM") {

            delta = 12 * 3600;
        }
        rwork = rwork[0].split(":");

        rwork = parseInt(rwork[0]) * 3600 + parseInt(rwork[1]) * 60 - info["duration"] + delta;

        var hour = parseInt(rwork / 3600);
        var min = parseInt((rwork % 3600) / 60);
        var time = "";
        var min_str = min < 10 ? "0" + min : min + "";
        var ma = "";
        if (hour > 12) {
            hour = hour - 12;
            ma = "PM";
        } else {

            ma = "AM";
        }
        var hour_str = "";
        if (hour < 10) {

            hour_str = "0" + hour;
        } else {

            hour_str = hour + "";
        }
        time = hour_str + ":" + min_str + " " + ma;

    }
    if (status == "departure") return (routeSelected ? ('Departs: ' +info.homeName)+" @ " +time: "");
    else if (status == "arrival") return (routeSelected ? ('Arrives: '+info.officeName+' @ '+ info.reachwork) : "You have chosen not to Shuttl to work");
}
function routeDetailsFromWork(status){
    var routeSelected = (info.leavework && info.leavework[0] != null);
    if (routeSelected) {
        var rwork = info.leavework[0];
        rwork = rwork.split(" ");

        var delta = 0;
        if (rwork[1] == "PM") {

            delta = 12 * 3600;
        }
        rwork = rwork[0].split(":");
        rwork = parseInt(rwork[0]) * 3600 + parseInt(rwork[1]) * 60 + info["duration"] + delta;
        var hour = parseInt(rwork / 3600);
        var min = parseInt((rwork % 3600) / 60);
        var time = "";
        var min_str = min < 10 ? "0" + min : min + "";
        var ma = "";
        if (hour > 12) {
            hour = hour - 12;
            ma = "PM";
        } else {

            ma = "AM";
        }
        var hour_str = "";
        if (hour < 10) {

            hour_str = "0" + hour;
        } else {

            hour_str = hour + "";
        }
        time = hour_str + ":" + min_str + " " + ma;
    }
    if (status == "departure") return (routeSelected ? ('Departs: '+info.officeName+' @ '+ info.leavework) : "You have chosen not to Shuttl home");
    else if (status == "arrival") return (routeSelected ? ('Arrives: '+info.homeName)+" @ "+time:"" );
}


function carouselSlide(obj, status, slot) {
    var NUMBER_OF_SLOTS = slots_final.length;
    if (slot == morningSlot) {
        if (status == "next" && morningSlot < NUMBER_OF_SLOTS / 3)
            morningSlot = morningSlot + 3;
        else if (status == "previous" && morningSlot > 0)
            morningSlot = morningSlot - 3;
        $(obj).attr("data-slide-to", morningSlot);
    }
    else if (slot == eveningSlot) {
        if (status == "next" && eveningSlot < NUMBER_OF_SLOTS / 3)
            eveningSlot = eveningSlot + 3;
        else if (status == "previous" && eveningSlot > 0)
            eveningSlot = eveningSlot - 3;
        $(obj).attr("data-slide-to", eveningSlot);
    }
}

function aboutUs() {
    var html = '<div id="aboutUsOverlay" style="overflow:visible!important">';
    html += '<section id = "overlay-one">';
    html += '<div id="overlay-logo" ><img style ="max-width:100px" vertical-align=middle width =175% src="../images/shuttl_logo.png"></div>';
    html += '<div id="overlay-introduction">';
    html += '<div style="color:#333333"><h5 style="margin-bottom: 2px">Introducing</h5></div>';
    html += '<div style="color:grey"><h5 style="margin-top:2px">#MakeYourOwnRoute</h5></div>';
    html += '</div>';
    html += '</section>';
    html += '<section id="overlay-two">';
    html += '<div id="home-to-office">';
    html += '<div style="color:white"><h4>Home</h4> </div>';
    html += '<img id="overlay-arrow" src ="../images/arrow.png" alt="arrow">';
    html += '<div style="color:white"><h4>Office</h4> </div>';
    html += '</div>';
    html += '<div id="pickup-drop"> <h4> Pickup - Drop </h4></div>';
    html += '<div id="route-information">';
    html += '<div class="flex">';
    html += '<div class="route-information-image"><img style="max-height:32px" src="../images/route_icon.png" alt="icon" /></div>';
    html += '<span class="route-information">';
    html += '<p style="font-size:16px"> Direct routes from home to office</p>';
    html += '</span>';
    html += '</div>';
    html += '<div class="flex">';
    html += '<div class="route-information-image"><img style ="max-height:32px" src="../images/friends_icon.png" alt="icon" /></div>';
    html += '<span class="route-information">';
    html += '<p style="font-size:16px"> Travel with friends and colleagues</p>';
    html += '</span>';
    html += '</div>';
    html += '</div>';
    html += '</section>';
    html += '<section id="overlay-three">';
    html += '<div id="overlay-starting-at"> <h3> Starting @ Rs 3/km </h3> </div>';
    html += '<hr>';
    html += '<div id="assured-seats"> <h5> AC buses | Assured seats </h5></div>';
    html += '<div><img class="vanImage" src="../images/van2.png"></div>';
    html += '</section>';
    html += '<div class="slide-left text-center"><h4> Got it! </h4></div>';
    html += '</div>';
    return html;
}




function getOfflineSharePromoCode(){
    return "" ;
}



function otpentered(obj) {


    if (/\d{4,4}/.test(jQuery(obj).val())) {
        var otp = jQuery(obj).val();

        showLoader();
        jQuery.ajax({url: "/suggest/verifyOtp?otp=" + otp + "&phoneNumber=" + info.phone_number}).done(function (response) {

            hideLoader();
            if (response["success"]) {

                onMobileVerified(info.phone_number);


            } else {

                alert("invalid otp");

                jQuery(obj).val("");
            }
        });
    }
}



function changePhoneNumber(){



    jQuery("#userPhoneNumber").show();
    jQuery(".otp-entry").hide();
}

function onPhoneNumberEntered(){

    if (/\d{10,10}/.test(jQuery("#userPhoneNumber").val())){

        info.phone_number=jQuery("#userPhoneNumber").val();
        validatePhone();
    }else{

        $('#phoneModal .error').html('invalid mobile number').fadeIn();
    }
}

function changeToLastScreen(){

    if (info.route_type=="new") {
        changeToStage(5);
    }else{
        changeToStage(5);
    }
}


function getRoutePass(){
    var html="";
    html+='<div class="shuttl_pass_info">';

    html+='<h2>Pass Information</h2>';

    html+='<ul>';
    html+='<li><span class="descrp">Definition:</span>A Ride is a one-way journey travelled from home-to-office or office-to-home.<br>  e.g. A return journey taken will be counted as 2 rides</li>';
    html+='<li><span class="descrp">Validity:</span>A Pass is valid for bookings for any available time slot only on the specific route it is purchased for. </li>';
    html+='<li><span class="descrp">Refund Policy:</span>Money will be refunded to your PayTM wallet, in case:';
    html+='<ul>'
    html+='<li> the route is not launched within one week of the launch date</li>';
    html+='<li>  customer is not satisfied with the service after taking no more than 3 rides.</li>';
    html+="</ul>";
    html+='<li><span class="descrp">Contact Us:</span> For any queries or complaints please reach out to us at myor@shuttl.com</li>';

    html+='<button class="gotit" onclick="hideRoutePass();">Got It</button>';
    html+='</div>';
    return html;
}

function showRoutePass(){

    jQuery(".shuttl_pass_info").show();
}
function hideRoutePass(){

    jQuery(".shuttl_pass_info").hide();
}

/**
 * Determine the mobile operating system.
 * This function either returns 'iOS', 'Android' or 'unknown'
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
    {
        return 'iOS';

    }
    else if( userAgent.match( /Android/i ) )
    {

        return 'Android';
    }
    else
    {
        return 'other';
    }
}

function getContacts() {

        var oauth_clientKey = '102753668527-7den3ik8ceg1ihacbv5agefpt5t1r6gb.apps.googleusercontent.com';
        var firstTry = true;
        function connect(immediate){
            var config = {
                'client_id': oauth_clientKey,
                'scope': 'https://www.google.com/m8/feeds',
                'immediate': immediate
            };

            gapi.auth.authorize(config, function () {
                var authParams = gapi.auth.getToken();
                $.ajax({
                    url: 'https://www.google.com/m8/feeds/contacts/rahul95/full'
                }).done(function (response) {
                    responseJson = response;
                    var parser = new DOMParser();
                    xmlDoc = parser.parseFromString(responseJson,"text/xml");
                    var entries = xmlDoc.getElementsByTagName('feed')[0].getElementsByTagName('entry');
                    var contacts = [];
                    for (var i = 0; i < entries.length; i++) {
                        var name = entries[i].getElementsByTagName('title')[0].innerHTML;
                        var image = entries[i].getElementsByTagName('link')[4].getAttribute("rel");
                        var number = entries[i].getElementsByTagName('[gd:phoneNumber]')[0].innerHTML;
                        contacts.push({name: name, image: image, number: number});
                    }
                    return(contacts);
                });
            });
        }
}
