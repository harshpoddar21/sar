/* google auto suggestor */

var px = 0;
var refer = {};
var info = {};
var fw = true;
var responseJson;
var slotBtns = '';

function initAutocomplete() {
    if (window.location.search!="" && window.location.search.match(/paths=([^\&]*)/g).length>0 && window.location.search.match(/paths=([^\&]*)/g)[0].split("=")[1]!=""){

        var polyline=window.location.search.match(/paths=([^\&]*)/g)[0].split("=")[1];
        var points=google.maps.geometry.encoding.decodePath(polyline);
        if (points.length==2) {
            var fromAdd = getGeoCodedAddress(points[0],function(result){

                info.homeAddress = result.formatted_address;
                info.homelat = points[0].lat();
                info.homelng = points[0].lng();
                jQuery("#homeLocation").val(info.homeAddress);

            });
            var toAddress = getGeoCodedAddress(points[1],function(result){

                info.officeAddress = result.formatted_address;
                info.officelat=points[1].lat();
                info.officelng=points[1].lng();
                jQuery("#officeLocation").val(info.officeAddress);
            });

            jQuery('.downArr').show();

            fillAdministrativeLevelDetails();
        }

    }
    if( (document.getElementById('officeLocation') != null) && (document.getElementById('homeLocation') != null) ){
        var homelocation = new google.maps.places.Autocomplete(
            (document.getElementById('homeLocation')),
            {types: ['geocode']});

        var officelocation = new google.maps.places.Autocomplete(
            (document.getElementById('officeLocation')),
            {types: ['geocode']});

        homelocation.addListener('place_changed', function() {
            $('.bounce').hide();
            var place1 = homelocation.getPlace();
            info.homeAddress = place1.formatted_address;
            info.homelat = place1.geometry.location.lat();
            info.homelng = place1.geometry.location.lng();

            fillAdministrativeLevelDetails();

        });
        officelocation.addListener('place_changed', function() {
            var place1 = officelocation.getPlace();
            info.officeAddress = place1.formatted_address;
            info.officelat = place1.geometry.location.lat();
            info.officelng = place1.geometry.location.lng();

            fillAdministrativeLevelDetails();
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
                url:'getSlots?path='+encodedPoints
            }).done(function(response){
                responseJson = response;
                hideLoader();
                if(response.route_type == 'Live_route'){
                    var slot = response.slots;
                    $.each(slot, function(key, value){
                        var time = formatSectoIST(value*60);
                        slotBtns += '<div class="item"><button type="button" class=" btn btn-default btnTime" data-value="'+time+'">'+time+'<span class="live">(live)</span></button></div>';
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
        });
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
        initMap(responseJson);
    }
});
function initMap(response) {
    $('#gMap').html('');
    var wpx = $('.screen .col-md-12').width();
    var hpx = $('.screen').height()/2.5+0;
    $('#gMap').css({'width':wpx+'px', 'height':hpx+'px'});

    var map = new google.maps.Map(document.getElementById('gMap'), {
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false
    });

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
    var bounds = new google.maps.LatLngBounds();
    $.each(decodedPath, function(key, value){
        var position = new google.maps.LatLng(decodedPath[key].lat(), decodedPath[key].lng());
        bounds.extend(position);
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

    var latlng = new google.maps.LatLng( decodedPath[closest].lat(), decodedPath[closest].lng() );

    var marker2 = new google.maps.Marker( {
        position: latlng,
        map: map,
        title: Math.round(Number(mindist)*1000) + " meters",
        icon: '/images/bus-stop.png'
    });

    var contentString = Math.round(Number(mindist)*1000) + " meters";    // HTML text to display in the InfoWindow
    var infowindow = new google.maps.InfoWindow( { content: contentString } );
    infowindow.open( map, marker2 );
    google.maps.event.addListener( marker2, 'click', function() { infowindow.open( map, marker2 ); });


    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    directionsDisplay.setMap(map);

    var originPts;
    if(fw){
        originPts = {lat: response.origin.lat, lng: response.origin.lng};
    }else{
        originPts = {lat: response.destination.lat, lng: response.destination.lng};
    }

    directionsService.route({
        origin: originPts,
        destination: latlng,
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });

    var setRegion = new google.maps.Polyline({
        path: decodedPath,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });
    map.fitBounds(bounds);
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

    jQuery(".item").first().addClass("active");
    $('#mycarousel').carousel({
        interval: false
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

    jQuery("#mycarousel2 .item").first().addClass("active");
    $('#mycarousel2').carousel({
        interval: false
    });
    $('#mycarousel2 .item').each(function () {
        var next = $(this).next();
        if (!next.length) {
            next = $(this).siblings(':first');
        }
        next.children(':first-child').clone().appendTo($(this));

        if (next.next().length > 0) {
            next.next().children(':first-child').clone().appendTo($(this));
        }
        else {
            $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
        }
    });
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
    $('.screen').css('min-height', screenHeight+'px');
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
});

function nextPrevVlickEvents(){
    $('.fa-angle-double-down, .nextBtnMap').on('click', function(){
        refer.stage = stage;
        refer.click = 'down';
        stage++;
        if(stage > 13){stage = 13};
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
    var inputtxt = $('#userPhoneNumber').val();
    var phoneno = /^\d{10}$/;
    if(inputtxt.match(phoneno)) {
        $('#phoneModal .error').html('').hide();
        $('.loader').fadeIn();
        $('#userPhoneNumber').attr('readonly', 'readonly');
        $.ajax({
            url : 'makePhoneCall?phone_number='+inputtxt,
            type : 'GET',
            dataType : 'json',
            contentType : "application/json; charset=utf-8",
            header : 'x-requested-with'
        })
            .done(function(result){
                if(result.success){
                    //checking userinput after every 2 seconds
                    interval = setInterval(function(){

                        validateMobileInput(inputtxt);
                    }, 2000);
                }else{
                    $('#phoneModal .error').html('invalid mobile number').fadeIn();
                }
            })
            .fail(function(err){
                $('.loader').fadeOut();
                $('#phoneModal .error').html('invalid mobile number').fadeIn();
            });
        validateMobileInput(inputtxt);
    }else {
        $('#phoneModal .error').html('invalid mobile number').fadeIn();
        return false;
    }
}
var tries=0;
function validateMobileInput(num){
    tries++;
    if (stage==4) {
        onMobileVerified(num);
    }
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
                if (stage==5) {
                    changeToStage(14)
                }
                else if (stage==10){

                    onForPaymentMobileVerified();

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

    $('.loader').fadeOut();
    clearInterval(interval);
    submitDataToServer(num);
    $('#phoneModal').modal('hide');
    refer.stage = stage;
    refer.click = 'down';
    stage++;
    if(stage > 13){stage = 13};
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
        stage = 13;
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
                if(info.leavework.length > 2){
                    $(obj).closest('.btn-group-justified').find('button[data-value="'+info.leavework[1]+'"]').addClass('btn-default').removeClass('btn-info');
                    info.leavework.splice(1, 1);
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
            var html =  '<div class="headText text-center">To <span class="highlight"><br/>#MakeYourOwnRoute</span></div>';
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
            html += '<div class="downArr dowfirst"><span class="fa fa-angle-double-down"></span></div>';
            $(obj).html(html)
                .find('.downArr').hide();

            if(refer.hasOwnProperty('click')){
                if(refer.stage >= 1){
                    $(obj).find('.downArr').fadeIn().end()
                        .find('#homeLocation').val(info.homeAddress).end()
                        .find('#officeLocation').val(info.officeAddress);
                }
            }
            break;

        case 2:
            var html = '<div class="upArr"><span class="fa fa-angle-double-up"></span></div>';
            html += '<div class="headText headText2 text-center">To help us serve you on time, please tell us what time you <span class="highlight lesshighlight"><br/>#ReachWork</span></div>';
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
            html += '<div class="downArr submit-butt"><div class="row col-md-12"><span class="btn btn-primary submitsurvey text-uppercase col-md-12">Submit</span></div></div>';
            html += '<div class="modal fade bs-example-modal-sm" role="dialog" id="phoneModal">';
            html += '<div class="modal-dialog modal-sm">';
            html += '<div class="modal-content">';
            html += '<div class="modal-body text-center"><input class="col-md-12" type="number" placeholder="Enter mobile no." maxlength="10" id="userPhoneNumber" onKeyup="validatePhone()" /><p class="error"></p><div class="loader"><em>You will receive a missed call on <i></i>. Press 1 to confirm</em><img src="/images/rolling.gif" /></div><div class="bounce">I\'m not interested</div></div>';
            html += '</div></div></div>';
            $('#phoneModal .error').html('').hide();
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
            html += '<h4 style="margin:0;" id="share_heading" class="text-center sharetext">Awaiting Missed Call Confirmation</h4><br />';
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
            html += '<div class="headText headText3 text-center">To launch the route soon <span class="highlight">#JustSpreadTheWord</span></div>';
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

        case 8:
            var html = '<div class="col-md-12 fullheight">';
            html += '<div class="fieldset">';
            html += '<div class="routeInfo"><span class="routePtName">'+info.homeAddressShortened+' To </span><span class="routePtName">'+info.officeAddressShortened+'</span></div>';
            html += '<div id="gMap"></div>';
            html += '<div class="mapMsg"><span class="seats"><span class="cur">14</span>/<span class="total">20</span></span> seats are full</div>';
            html += '<div class="fillingfast">4 more ppl required to launch route in 8 days</div>';
            html += '</div>';
            html += '<div class="line1">To Travel on this route, tell us</div>';
            html += '<div class="line2">What time do you have to reach work?</div>';
            html += '<div class="carousel slide" id="mycarousel">';

            //html += '<span class="btnsWrapper">';
            html += '<div class="carousel-inner btns btn-group-justified" data-roletype="reachwork">';

            html += slotBtns;
            /*
             html += '<button type="button" class="btn btn-default btnTime" data-value="99:99">99:99<span class="live">(live)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="8:30">8:30</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:00">9:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:30">9:30<span class="live">(filling fast)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:00">10:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:30">10:30</button>';
             */

            html += '</div>';
            html += '<a class="left carousel-control" href="#mycarousel" role="button" data-slide="prev"> <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> <span class="sr-only">Previous</span></a>';
            html += '<a class="right carousel-control" href="#mycarousel" role="button" data-slide="next"> <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span> <span class="sr-only">Next</span></a>';
            //	html += '</span>';
            //html += '<span class="btn btn-default rightbtn">&gt;</span>';
            html += '</div>';
            html += '<div class="fillingfast">(leave blank if you don\'t wish to use shuttl in the morning)</div>';
            html += '<div class="text-capitalize btn btn-default col-xs-6 bouncebtn">not interested</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 nextBtnMap">next&gt;</div>';
            html += '</div>';
            $(obj).html(html);
            notInterested();

            $('.bounce').addClass('hidden');
            fw = true;
            setTimeout(function(){
                timeCapture();
                setCarousel();
                if (info.reachwork!=undefined && info.reachwork.length>0){

                    jQuery(".item button").each(function(){

                        if (jQuery(this).attr("data-value")==info.reachwork[0]){

                            jQuery(this).removeClass("btn-default").addClass("btn-info");
                        }
                    });
                }
                initMap(responseJson);
            },310);
            break;

        case 9:
            var html = '<div class="col-md-12 fullheight">';
            html += '<div class="fieldset">';
            html += '<div class="routeInfo"><span class="routePtName">'+info.officeAddressShortened+' To </span><span class="routePtName">'+info.homeAddressShortened+'</span></div>';
            html += '<div id="gMap"></div>';
            html += '<div class="mapMsg"><span class="seats"><span class="cur">14</span>/<span class="total">20</span></span> seats are full</div>';
            html += '<div class="fillingfast">4 more ppl required to launch route in 8 days</div>';
            html += '</div>';
            html += '<div class="line2">What time do you leave from work?</div>';
            html += '<div class="carousel slide" id="mycarousel2">';

            //html += '<span class="btnsWrapper">';
            html += '<div class="carousel-inner btns btn-group-justified" data-roletype="leavework">';

            html += slotBtns;
            /*
             html += '<button type="button" class="btn btn-default btnTime" data-value="99:99">99:99<span class="live">(live)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="8:30">8:30</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:00">9:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="9:30">9:30<span class="live">(filling fast)</span></button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:00">10:00</button>';
             html += '<button type="button" class="btn btn-default btnTime" data-value="10:30">10:30</button>';
             */

            html += '</div>';
            html += '<a class="left carousel-control" href="#mycarousel2" role="button" data-slide="prev"> <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> <span class="sr-only">Previous</span></a>';
            html += '<a class="right carousel-control" href="#mycarousel2" role="button" data-slide="next"> <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span> <span class="sr-only">Next</span></a>';
            //	html += '</span>';
            //html += '<span class="btn btn-default rightbtn">&gt;</span>';
            html += '</div>';
            html += '<div class="fillingfast">leave blank if you don\'t wish to use shuttl in the evening</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 backBtnMap">&lt;back</div>';
            html += '<div class="text-capitalize btn btn-primary col-xs-6 nextBtnMap">next&gt;</div>';
            html += '</div>';
            $(obj).html(html);

            setTimeout(function () {


                setCarousel2();
                timeCapture();
                if (info.leavework!=undefined && info.leavework.length>0){

                    jQuery(".item button").each(function(){

                        if (jQuery(this).attr("data-value")==info.leavework[0]){

                            jQuery(this).removeClass("btn-default").addClass("btn-info");
                        }
                    });
                }
            },310);

            fw = false;
            $('.bounce').addClass('hidden');
            setTimeout(function(){
                initMap(responseJson);
            },310);
            break;

        case 10:
            var html = '<div class="col-md-12 text-center fullheight">';
            html += '<h4 style="margin:0;" class="text-center">Hey! Your Routes are almost LIVE..</h4><br />';
            html += '<fieldset class="pay">';
            html += '<legend class="payments"><span class="home">'+info.homeAddressShortened+'</span> <> <span class="office">'+info.officeAddressShortened+'</span></legend>';
            html += '<div class="box">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Going To Work</span>';
            html += '<span class="change" onclick="goToReachWorkScreen(this);">change</span>';
            html += '</div>';
            html += '<div class="routeinfo">Departs: '+info.homeAddressShortened+'</div>';
            html += '<div class="routeinfo">Arrives: '+info.officeAddressShortened+' @'+(info.reachwork!=undefined?info.reachwork:"")+'</div>';
            html += '<div class="fillingfast" style="display:none;">8 more ppl required to launch route</div>';
            html += '</div>';

            html += '<div class="box">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Return From Work</span>';
            html += '<span class="change"  onclick="goToLeaveWorkScreen(this);">change</span>';
            html += '</div>';
            html += '<div class="routeinfo">Departs:'+info.officeAddressShortened+' @'+info.leavework+'</div>';
            html += '<div class="routeinfo">Arrives:'+info.homeAddressShortened+'</div>';
            html += '<div class="fillingfast" style="display:none;">4 more ppl required to launch route</div>';
            html += '</div>';

            html += '</fieldset>';
            html += '<div class="headText headText4 text-center">To travel on this route select a pass</div>';
            /*
             html += '<div class="text-capitalize paynow btn btn-primary col-xs-6" data-value="499">10-Rides @ 499</div>';
             html += '<div class="text-capitalize paynow btn btn-primary col-xs-6" data-value="1800">Promo Monthly @ Rs 1800</div>';
             html += '<div class="fillingfast">(we\'ll charge your wallet just before launching the service)</div>';
             */
            html += '<br /><div class="btn btn-primary full paynow col-md-12" onclick="initiatePaymentProcess();">I Am Interested</div><br />';
            html += '<br /><div class="btn btn-primary full bouncebtn not-int col-md-12">Not Interested</div>';
            html += '</div>';
            html += '<div class="modal fade bs-example-modal-sm" role="dialog" id="phoneModal">';
            html += '<div class="modal-dialog modal-sm">';
            html += '<div class="modal-content">';
            html += '<div class="modal-body text-center"><input class="col-md-12" type="number" placeholder="Enter mobile no." maxlength="10" id="userPhoneNumber" onKeyup="validatePhone()" /><p class="error"></p><div class="loader"><em>You will receive a missed call on <i></i>. Press 1 to confirm</em><img src="/images/rolling.gif" /></div><div class="bounce">I\'m not interested</div></div>';
            html += '</div></div></div>';
            $(obj).html(html);
            notInterested();
            $('.paynow').on('click', function(){
                var rs = $(this).attr('data-value');
            });
            break;

        case 11:
            var html = '<div class="col-md-12 text-center fullheight">';
            html += '<h4 style="margin:0;" class="text-center">Hey! Your Routes are almost LIVE..</h4><br />';
            html += '<fieldset class="pay">';
            html += '<legend class="payments"><span class="home">'+info.homeAddressShortened+'</span> <> <span class="office">'+info.officeAddressShortened+'</span></legend>';
            html += '<div class="box">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Going To Work</span>';
            //html += '<span class="change">change</span>';
            html += '</div>';
            html += '<div class="routeinfo">'+info.homeAddressShortened+'</div>';
            html += '<div class="routeinfo">Arrives: TCS, Main Gate @ '+info.reachwork+'</div>';
            html += '<div class="fillingfast" style="display:none;">8 more ppl required to launch route</div>';
            html += '</div>';

            html += '<div class="box">';
            html += '<div class="boxrow">';
            html += '<span class="heading">Return From Work</span>';
            //html += '<span class="change">change</span>';
            html += '</div>';
            html += '<div class="routeinfo">'+info.officeAddressShortened+'</div>';
            html += '<div class="routeinfo">Arrives: TCS, Main Gate @ 8:55 AM</div>';
            html += '<div class="fillingfast" style="display:none;">4 more ppl required to launch route</div>';
            html += '</div>';

            html += '<div class="fillingfast">8 more days left to launch route</div>';

            html += '</fieldset>';
            html += '<div class="headText headText3 text-center">To launch the route soon <span class="highlight">#JustSpreadTheWord</span></div>';
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
        case 12:
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

        case 13:
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

        case 14:
            var html ='<div class="col-md-12 text-center fullheight">';
            html += '<h4 style="margin:0;" class="text-center allow-notification">To track your Shuttl and its arrival at your doorstep please click on "Allow"</h4><br />';
            html += '<script src="../assets/pushNotifications.js"> </script>';
            html += '</div>';
            $(obj).html(html);
            var rideBooked = "success";
            setTimeout(function(){ changeToStage(15); }, 7000);
            break;

        case 15:
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
            html += '<div class="headText headText3 text-center">To launch the route soon <span class="highlight">#JustSpreadTheWord</span></div>';
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

        default:
            window.location = '';

    }
    nextPrevVlickEvents();
    return true;


}

function   submitDataToServer(phone_number){

    $.ajax({
        url : 'saveNewSuggestion',
        type : 'GET',
        data:{phone_number:phone_number,data:info},
        dataType : 'json',
        contentType : "application/json; charset=utf-8",
        header : 'x-requested-with'
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
            if (results[1]) {

                callback(results[1]);
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


    jQuery('#whatsapp').attr("href_send","whatsapp://send?text="+"Start your shuttl at Rs 3/Km.Just log on to http://myor.shuttl.com/suggest/index?paths="+encodedPoints+"&utm_source=whatsapp");

    jQuery.ajax({url:"/suggest/getWhatsAppShareLink?url="+"http://myor.shuttl.com/suggest/index?paths="+encodedPoints}).done(function(result){

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
        jQuery('#phoneModal').modal("show");
    }else{

        changeToStage(11);
    }
}

function onForPaymentMobileVerified(phoneNumber){

    jQuery.ajax({url:"/payment/checkUserEligibilityForPayment?phoneNumber="+phoneNumber}).done(function(result){

        if (result.success){

            if (result.redirect!=undefined){

                window.location.href=result.redirect;

            }else{

                alert("We are sorry.But something went wrong.Please try again.");
            }

        }else{

            alert(result.message);

        }
        jQuery("#phoneModal").modal("hide");

    });

}

function showLoader(){

    jQuery(".loader_wrapper").show();

}
function hideLoader(){

    jQuery(".loader_wrapper").hide();
}

function goToLeaveWorkScreen(obj){

    stage = 9;
    window.location.hash = 'stage'+stage;
    $(obj).closest('.screen').outerHeight();
    var handle = $(obj).closest('.screen');
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

}

function goToReachWorkScreen(obj){
    stage = 8;
    window.location.hash = 'stage'+stage;
    $(obj).closest('.screen').outerHeight();
    var handle = $(obj).closest('.screen');
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