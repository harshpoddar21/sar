/**
 * Created by Rahul Amlekar - Shuttl on 6/28/2016.
 */
/* google auto suggester */

var px = 0;
var refer = {};
var info = {};
var responseJson;
var slotBtnsM = '';
var slotBtnsE = '';
var eveningSlot = 88;
var slots_final=[];
var duration;
var origin;
var registrations_today = localStorage.getItem("total_regs")?localStorage.getItem("total_regs"):0;
var uploaded = 0;
var returnToStage;



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
        //   initMap(responseJson,"OTD");
    }
});
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

function toggleBooking(obj) {
    if($(obj).hasClass('btn-default')) {
        info.makeBooking = true;
        $(obj).removeClass('btn-default').addClass('btn-info');
    }

    else if($(obj).hasClass('btn-info')){
        info.makeBooking = false;
        $(obj).removeClass('btn-info').addClass('btn-default');
    }
}

function checkState() {
    if (info.makeBooking) {
        $(booking).removeClass('btn-default').addClass('btn-info');
    }
}

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
var tries=0;

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

function newForm()
{
    setToLocalStorage();
    submitDataToServer();
    changeToStage(2);
}

function clickLogo () {
    submitDataToServer();
    returnToStage = stage;
    changeToStage(1);
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
        initAutocomplete();
    });

    $('.mslots').on('click', function(){
        stage = 4;
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
        stage = 5;
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

    $('.phone-number').on('click', function(){
        stage = 6;
        window.location.hash = 'stage'+stage;
        $(this).closest('.screen').outerHeight();
        var handle = $(this).closest('.screen');
        var px = $(handle).outerHeight();
        var newHandle = createScreenBox(handle, 'before', '-'+px);
        setHeight();
        $(handle).css('top',px+'px');
        setTimeout(function(){
            $(newHandle).css('top','0');
        },0);
        setTimeout(function(){
            $(handle).remove();
        },300);
    });



}

function refreshData(){
    submitDataToServer();
    changeToStage(1);
}
function set(stage) {
    if (origin) {
        origin = null;
    }
    changeToStage(stage);
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


function switchScreen (scrno, obj){
    ga('send', 'event', 'screen_no', scrno);
    switch(scrno){
        case 1:

            if (!localStorage.getItem('promoterID')) {
                changeToStage(8);
            }
            else{
                var html = '<div class="col-md-12 text-center" style="height: 100%;position:static;">';
                html += '<div class="confirmed-registrations"><div>' + registrations_today + '/87 confirmed registrations today </div><div class="ask-refresh">Please press the refresh button below once connected to internet </div></div>';
                html += '<div class="select-boarding-point"><h3> Select Boarding Points </h3></div>';
                html += '<div class= "set-location-button home btn btn-default" onclick="set(2)"> SET HOME </div>';
                html += '<div class = "set-location-button office btn btn-default" onclick="set(3)"> SET OFFICE </div>';
                html += '<div id = "back" onclick="changeToStage(returnToStage)" class = "back-refresh btn btn-default"> Back </div>';
                html += '<div id = "refresh" onclick = "refreshData()" class = "back-refresh btn btn-default"> Refresh </div>';
                html += '<div onclick = "logOut()" class="btn btn-default logout"> Logout </div>';
                html += '<div class="downArr dowfirst"><span class="fa fa-angle-double-down"></span></div>';

                $(obj).html(html)
                    .find('.downArr').hide();

                /*if (registrations_today == uploaded) {
                 //   $('.ask-refresh').hide();
                 }
                 else {
                 $('.ask-refresh').show();
                 }*/
            }
            break;

        case 2:
            if (origin && origin=='home'){
                changeToStage(3);
            }
            var html = '<div class="col-md-12" style="height: 100%;">';
            html += '<div class = "select-boarding-point-home text-center"><h3> Select boarding point near home </h3> </div>';
            html += '<button type="button" class = "boarding-point-home" data-value="Vaishali Metro"> Vaishali Metro </button>';
            html += '<button type="button" class = "boarding-point-home" data-value="Kaushambi Metro"> Kaushambi Metro </button>';
            html += '<button type="button" class = "boarding-point-home" data-value="Hassanpur Depot"> Hassanpur Depot </button>';
            html += '<button type="button" class = "boarding-point-home" data-value="Preetvihar Metro"> Preetvihar Metro </button>';
            html += '<button type="button" class = "boarding-point-home" data-value="Laxminagar Metro"> Laxminagar Metro </button>';
            html += '<div class="downArr dowfirst"><span class="fa fa-angle-double-down"></span></div>';

            $(obj).html(html)
                .find('.downArr').hide().end()
                .find('.upArr').hide();

            if(refer.hasOwnProperty('click')) {
                if (refer.stage >= 1) {
                    $(obj).find('.upArr').fadeIn();
                }
                if (info.reachwork != undefined) {
                    $(obj).find('.downArr').fadeIn();
                }
            }

            $('.boarding-point-home').on('click', function() {
                var obj = $(this);
                info.homeAddress = $(obj).attr('data-value');
                if (!origin) {
                    origin = 'home';
                    window.alert("Origin set. To change the origin, please click on the Shuttl logo on the top of the page.");
                }
                if (origin && origin =='office') {
                    changeToStage(4);
                }
                else changeToStage(3);
            });
            break;

        case 3:
            if (origin && origin =='office'){
                changeToStage(2);
            }
            var html = '<div class="upArr"><span class="fa fa-angle-double-up"></span></div>';
            html += '<div class="col-md-12" style="height: 100%;">';
            html += '<div class = "select-boarding-point-home text-center"><h3> Select office location </h3> </div>';
            html += '<button type="button" class = "boarding-point-office" data-value="Cyber City"> Cyber City </button>';
            html += '<button type="button" class = "boarding-point-office" data-value="Udyog Vihar"> Udyog Vihar </button>';
            html += '<button type="button" class = "boarding-point-office" data-value="Gold Course Road"> Golf Course Road </button>';
            html += '<button type="button" class = "boarding-point-office" data-value="Gold Course Extention Road"> Golf Course Extention Road </button>';
            html += '<button type="button" class = "boarding-point-office" data-value="Sohna Road"> Sohna Road </button>';
            html += '<button type="button" class = "boarding-point-office" data-value="Sector 43-45"> Sector 43-45 </button>';
            html += '<button type="button" class = "boarding-point-office" data-value="Unitech Cyberpark"> Unitech Cyberpark </button>';
            html += '<div class="downArr dowfirst"><span class="fa fa-angle-double-down"></span></div>';

            $(obj).html(html)
                .find('.downArr').hide().end()
                .find('.upArr').hide();
            if(refer.hasOwnProperty('click')) {
                if (refer.stage >= 1) {
                    $(obj).find('.upArr').fadeIn();
                }
                if (info.reachwork != undefined) {
                    $(obj).find('.downArr').fadeIn();
                }
            }
            $('.boarding-point-office').on('click', function() {
                var obj = $(this);
                info.officeAddress = $(obj).attr('data-value');
                if (!origin){
                    origin = 'office';
                    window.alert("Origin set. To change the origin, please click on the Shuttl logo on the top of the page.");
                }
                if (origin && origin=='office')
                {
                    changeToStage(2);
                }
                else changeToStage(4);
            });
            break;

        case 4:

            var html = '<div class="upArr"><span class="fa fa-angle-double-up"></span></div>';
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

            if (info.reachwork && info.reachwork.length == 2){
                info.reachwork = [];
            }
            if(refer.hasOwnProperty('click')){
                if(refer.stage >= 3){
                    $(obj).find('.upArr').fadeIn();
                }
                if(info.reachwork != undefined){
                    $(obj).find('.downArr').fadeIn();
                }
            }
            if (info.reachwork != undefined) {
                $.each(info.reachwork, function (key, value) {
                    $(obj).find('button[data-value = "' + value + '"]').removeClass('btn-default').addClass('btn-info');
                });
            }

            timeCapture();

            if (info.reachwork && info.reachwork.length == 0)
            {
                jQuery('.downArr').hide();
            }
            break;

        case 5:

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

            if (info.leavework && info.leavework.length == 2){
                info.leavework = [];
            }
            if(refer.hasOwnProperty('click')){
                if(refer.stage >= 4){
                    $(obj).find('.upArr').fadeIn();
                }
                if(info.leavework != undefined){
                    $(obj).find('.downArr').fadeIn();
                }
            }
            if (info.leavework != undefined) {
                $.each(info.leavework, function (key, value) {
                    $(obj).find('button[data-value = "' + value + '"]').removeClass('btn-default').addClass('btn-info');
                });
            }




            timeCapture();

            if (info.leavework && info.leavework.length == 0)
            {
                jQuery('.downArr').hide();
            }
            break;

        case 6:
            var html = '<div class="upArr"><span class="fa fa-angle-double-up"></span></div>';
            html += '<div class="headText headText2 text-center phone-number-text">To help us contact you when the route is live </div>';
            html += '<div class = "booking-button text-center">';
            html += '<button id = "booking" type="button" class="btn btn-default" onclick="toggleBooking(this)"> Place booking </button>';
            html += '</div>';
            html += '<div class="col-md-12 text-center fullheight" >';
            html += '<form class="phone-number-form"><input class= "phone-number-input text-center" type="number" name="phone-number"  placeholder="Enter Mobile No" maxlength="10" id="userPhoneNumber" onKeyup="onPhoneNumberEntered()"></form>';
            html += '</div>';
            $(obj).html(html);

            checkState();

            if (!info.phone_number)
            {
                jQuery('.downArr').hide();
            }
            break;

        case 7:
            var html = '<div class="col-md-12 text-center" style="height: 100%;position: static;">';
            html += '<h4 style="margin:0;" id="share_heading" class="text-center sharetext">Congratulations!! You have successfully made</h4><br />';
            html += '<fieldset>';
            html += '<legend>#YourRoute</legend>';
            html += '<div class="col-md-12 routeHeading text-capitalize">';
            html += '<div class="routeCreated"><span class="home">'+info.homeAddress+'</span> <> <span class="office">'+info.officeAddress+'</span></div>';
            html += '</div>';
            html += '<div class="col-md-12 slotRow ">';
            html += '<span class="slotHeading">Morning Slots: </span>';
            html += '<span class="mslots"><span class="slots">'+ info.reachwork[0] +'</span> & <span class="slots">'+ info.reachwork[1] + '</span></span>';
            html += '</div>';
            html += '<div class="col-md-12 slotRow">';
            html += '<span class="slotHeading">Evening Slots : </span>';
            html += '<span class="eslots"><span class="slots">'+ info.leavework[0] +'</span> & <span class="slots">'+ info.leavework[1] + '</span></span>';
            html += '</div>';
            html += '<div class="col-md-12 slotRow">';
            html += '<span class="slotHeading"> Your phone number: </span>';
            html += '<span class= "phone-number"><span class="slots">' + info.phone_number + '</span></span>';
            html += '</div>';
            html += '<h6 class="text-center">( Click above to change info )</h6>';
            html += '</fieldset>';
            html += '<p class="routeCount"><span class="count">3</span> other people have made same route</p><br/>';
            html += '<div class="row social">';
            html += '<div class="col-md-12">';
            html += '<a class="fa-social" id="whatsapp"><span class="full" onclick="newForm()" style="padding: 13px;display:table;">New ></span></a>';
            html += '</div></div></div>';


            /* var mSlots = '';
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
             topPx = Number(topPx)-100;*/
            $(obj).html(html)
                .find('.home').html(info.homeAddress).end()
                .find('.office').html(info.officeAddress).end()
                .find('.office').html(info.officeAddress).end();
            /*.find('.mslots').html(mSlots).end()
             .find('.eslots').html(eSlots).end()
             .find('.social').css('top',topPx).end();*/

            /*            jQuery('.bounce').css("display","none");*/

            routeSummary();




            break;

        case 8:
            var html = '<section class="loginform cf"><form name="login">';
            html += '<ul><li><label for="username">Username</label><input type="text" name="username" placeholder="Username" required>';
            html += '</li><li><label for="password">Password</label><input type="password" name="password" placeholder="password" required></li>';
            html += '<li> <input type="submit" value="Login" onclick="doesUserExist()" style="margin-top:30px">  </li> </ul> </form>';
            html += '<div class="incorrect-entry"> Incorrect username or password </div></section>';
            $(obj).html(html);

            break;



        default:
            window.location = '';

    }

    nextPrevVlickEvents();
    return true;
}

function setToLocalStorage()
{
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        info["routeid"]=831;
        info["route_type"]="Live_route";
        localStorage.setItem('data' + registrations_today, JSON.stringify(info));
        registrations_today++;

        localStorage.setItem("total_regs",registrations_today);
    }
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


function showLoader(){

    jQuery(".loader_wrapper").show();

}
function hideLoader(){

    jQuery(".loader_wrapper").hide();
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

function onPhoneNumberEntered(){

    if (/\d{10,10}/.test(jQuery("#userPhoneNumber").val())){

        info.phone_number = $("#userPhoneNumber").val();
        changeToStage(7);
    }
}



function changeToLastScreen(){

    if (info.route_type=="new") {
        changeToStage(5);
    }else{
        changeToStage(5);
    }
}

var isSubmittingToServer=false;
var lastSubmitTime=0;
function submitDataToServer() {

    if (!isSubmittingToServer) {
        uploaded=0;
        lastSubmitTime=Math.floor(Date.now());

        var leng=0;
        for (var i = 0; i < localStorage.length; i++) {
            var currKey = localStorage.key(i);
            if (! (/data*/.test(currKey))){

                continue;
            }
            leng++;
            if (localStorage.getItem(currKey) !== 'classic' && currKey !== 'promoterID') {
                isSubmittingToServer=true;
                $.ajax({
                    url: 'saveNewSuggestionTab',
                    method: 'POST',
                    data: {data1: localStorage.getItem(currKey)}
                })
                    .done(function (result) {
                        uploaded++;
                        checkIfUploadingComplete(leng,currKey);

                    })
                    .fail(function (err) {

                    });
            }
        }
    }
}
var uploaded=[];
function checkIfUploadingComplete(totalLength,currKey) {

    if (uploaded==totalLength){

        isSubmittingToServer=false;
        var start=0;
        for (var i=0;i<localStorage.length;i++){

            var currKey=localStorage.key(i);

            if (/data*/.test(currKey)){

                localStorage.removeItem(currKey);
                start++;
                if (start>uploaded){

                    break;
                }
            }
        }
        uploaded=0;

    }
}




setInterval(function(){

    if (Math.floor(Date.now())-lastSubmitTime>5*60*1000 && isSubmittingToServer){

        isSubmittingToServer=false;
    }
    submitDataToServer();
}, 5000);


function doesUserExist() { // make api call to backend


    var userName=jQuery("input[name='username']").val();
    var password=jQuery("input[name='password']").val();
    jQuery.ajax({url:"/suggest/logPromoterIn?username="+userName+"&password="+password}).done(function(response){
        
        if (response["success"]){

            logIn(response["data"]["promoterId"]);
            
        }else{
            
            
            alert("Login Failed");

            $(".incorrect-entry").show();
        }
        
    });
     // if exists, pass username to the function, else pass null
}

function logIn(username) {
    if (username){
        info.promoterID = username;
        localStorage.setItem("promoterID", String(info.promoterID));
        changeToStage(1);
    }
    else {
        $(".incorrect-entry").show();
    }
}

function logOut() {
    info.promoterID = null;
    localStorage.removeItem('promoterID');
    changeToStage(8);
}