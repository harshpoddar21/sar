/* google auto suggestor */

var px = 0;
var refer = {};
var info = {};

function initAutocomplete() {
    if( (document.getElementById('officeLocation') != null) && (document.getElementById('homeLocation') != null) ){
        var homelocation = new google.maps.places.Autocomplete(
            (document.getElementById('homeLocation')),
            {types: ['geocode']});

        var officelocation = new google.maps.places.Autocomplete(
            (document.getElementById('officeLocation')),
            {types: ['geocode']});

        homelocation.addListener('place_changed', function() {
            var place1 = homelocation.getPlace();
            info.homeAddress = place1.formatted_address;
            info.homelat = place1.geometry.location.lat();
            info.homelng = place1.geometry.location.lng();
        });
        officelocation.addListener('place_changed', function() {
            var place1 = officelocation.getPlace();
            info.officeAddress = place1.formatted_address;
            info.officelat = place1.geometry.location.lat();
            info.officelng = place1.geometry.location.lng();
            $('.downArr .fa-angle-double-down').trigger('click');
        });
    }
}
/* google auto suggestor */
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

$(function() {
    screenHeight = screen.availHeight-33;
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
    $('.fa-angle-double-down').on('click', function(){
        refer.stage = stage;
        refer.click = 'down';
        stage++;
        if(stage > 11){stage = 11};
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

    $('.fa-angle-double-up').on('click', function(){
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
    }else {
        $('#phoneModal .error').html('invalid mobile number').fadeIn();
        return false;
    }
}
var tries=0;
function validateMobileInput(num){
    tries++;
    onMobileVerified(num);
    return;

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
                onMobileVerified();
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
    if(stage > 11){stage = 11};
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
    $('.bounce').on('click', function(){
        stage = 10;
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
    $('.reachwork button, .leavework button, .commutework button').on('click', function(){
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
                if(info.reachwork.length > 2){
                    $(obj).closest('.btn-group-justified').find('button[data-value="'+info.reachwork[1]+'"]').addClass('btn-default').removeClass('btn-info');
                    info.reachwork.splice(1, 1);
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
            var html =  '<br /><br /><br /><div class="headText text-center">To <span class="highlight">#MakeYourOwnRoute</span></div>';
            html += '<div class="col-md-12"><br /><br />';
            html += '<div class="form-group form-group-wrapper">';
            html += '<div class="input-group">';
            html += '<div class="input-group-addon"><span class="fa fa-home"></span></div>';
            html += '<input type="text" class="form-control loc" name="homeLocation" id="homeLocation" placeholder="Enter Home Address" autocomplete="off" />';
            html += '<div class="input-group-addon remove"><span class="fa fa-remove"></span></div>';
            html += '</div></div></div>';


            html += '<br /><h4 class="text-center">AND</h4><br />';

            html += '<div class="col-md-12">';
            html += '<div class="form-group form-group-wrapper">';
            html += '<div class="input-group">';
            html += '<div class="input-group-addon"><span class="fa fa-suitcase"></span></div>';
            html += '<input type="text" class="form-control loc" name="officeLocation" id="officeLocation" placeholder="Enter Office Address" autocomplete="off" />';
            html += '<div class="input-group-addon remove"><span class="fa fa-remove"></span></div>';
            html += '</div></div></div>';
            html += '<div class="downArr"><span class="fa fa-angle-double-down"></span></div>';
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
            html += '<div class="headText headText2 text-center">To help us serve you on time, please tell us what time do you <span class="highlight">#ReachWork</span></div>';
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
            html += '<div class="headText headText2 text-center">And also, what time do you <span class="highlight">#LeaveFromWork</span></div>';
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
            html += '<div class="headText headText3 text-center">Oh wait!! we almost forgot to ask how you <span class="highlight">#TravelToWork</span></div>';
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
            html += '<div class="downArr"><div class="col-md-12"><span class="btn btn-primary submitsurvey col-md-12">submit</span></div></div>';
            html += '<div class="modal fade bs-example-modal-sm" role="dialog" id="phoneModal">';
            html += '<div class="modal-dialog modal-sm">';
            html += '<div class="modal-content">';
            html += '<div class="modal-body text-center"><input class="col-md-12" type="number" placeholder="Enter mobile no." maxlength="10" id="userPhoneNumber" onKeyup="validatePhone()" /><p class="error"></p><div class="loader"><em>You will receive a missed call. Press 1 to confirm</em><img src="images/rolling.gif" /></div><div class="bounce">I\'m not interested</div></div>';
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
            var html = '<div class="col-md-12 text-center">';
            html += '<h4 style="margin:0;" class="text-center">Great! you have successfully made</h4><br />';
            html += '<fieldset>';
            html += '<legend>#Your Own Route</legend>';
            html += '<div class="col-md-12 routeHeading text-capitalize">';
            html += '<div class="routeCreated"><span class="home">Vasant kunj</span> <> <span class="office">Udyog vihar</span></div>';
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
            html += '<span class="fa fa-google-plus col-md-3"></span>';
            /*html += '<span class="fa fa-facebook col-md-3"></span>';
             html += '<span class="fa fa-linkedin col-md-3"></span>';
             */
            html += '<a class="fa-social" href="whatsapp://send?text=Hello%20World!"><span class="fa fa-whatsapp col-md-3"></span></a>';
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
            topPx = Number(topPx)-64;
            $(obj).html(html)
                .find('.home').html(info.homeAddress).end()
                .find('.office').html(info.officeAddress).end()
                .find('.office').html(info.officeAddress).end()
                .find('.mslots').html(mSlots).end()
                .find('.eslots').html(eSlots).end()
                .find('.social').css('top',topPx).end();

            jQuery('.bounce').css("display","none");
            routeSummary();
            break;

        case 10:
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