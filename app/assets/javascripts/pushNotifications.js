var _izooto = {
    client: 2232,
    sourceOrigin: "https://newshuttl.izooto.com",
    webPushId: "web.com.izooto.user1085",
    webServiceUrl: "https://safari.izooto.com/services/2427/safari/2232",
    mobileAllowed: 1,
    desktopAllowed: 1,
    domainRoot: ".",
    setEnr: 1,
    izootoStatus: 1
};
_izooto.isSubDomain = checkSubDomain();
_izooto.debug = 0;
_izooto.locationProtocol = document.location.protocol;
_izooto.setEnrUrl = _izooto.locationProtocol + "//izooto.m-bazaar.in/index.php";
_izooto.sendEnrUrl = _izooto.locationProtocol + "//izooto.m-bazaar.in/api.php";
_izooto.bkey = 0;
_izooto.bkeySent = 0;
_izooto.flag = 0;
_izooto.pluginStatus = 0;
_izooto.deviceType = izGetDevice();
_izooto.browser = izGetBrowser();
_izooto.isLocalStorage = "localStorage" in window && null !== window.localStorage;
_izooto.serviceWorker = _izooto.domainRoot + "/service-worker.js";
_izooto.manifest = _izooto.domainRoot + "/manifest.json";
_izooto.isSafari = checkIfSafari();
_izooto.isChrome = checkIfChrome();
_izooto.isFirefox = checkIfFirefox();
_izooto.dialogDesign = '<style>.iz_container{text-align: center; display:table-cell; vertical-align:middle;}.iz_overlay{position:fixed;top:0px;left:0px;width:100%;height:100%;background:rgba(0, 0, 0, 0.32); z-index: 9999999;}.iz_content{position:absolute;top:50%;left:50%;width:25%;transform:translate(-50%,-50%);background:#fff;border-radius:10px 10px 0px 0px;border-radius:10px;text-align: center; display:inline-block;}.iz_btn{font-family: cambria; margin-top: 3%; background: rgba(2,20,90,211);; color: #fff !important; margin-bottom: 4%; padding: 10px;  width: 110px; border: none; font-size: 13px; letter-spacing: 1px; box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12); transition: all .3s ease-out; cursor: pointer;}.iz_btn:hover{box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);cursor:pointer;}.iz_head_txt{letter-spacing:1px;font-size: 16px;font-family: Arial;}.iz_arrow{width:40px;}.iz_top{padding-bottom: 0.1px !important;border-radius:10px 10px 0px 0px;background: #fff; color: #000 !important; padding: 17px;}.iz_strp{color: #fff !important; background: transparent; display: inline-block; padding: 2px 10px; margin-top: 2%; border-radius: 2px; font-size: 14px;}.iz_txt{margin-top: 25px; font-size: 12px; color: #000;font-family: Arial;letter-spacing:1px}.iz_txt2{letter-spacing:1px;font-family: Arial;color:#000;margin-top:20px;font-size: 12px;}.iz_arrow-down{width: 0px; height: 0px; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 12px solid #963A3A; position: absolute; top: 40%; left: 50%; transform: translate(-50%,-45%);}@media only screen and (max-width: 600px) and (min-height: 300px){.iz_content{background: #fff none repeat scroll 0 0; border-radius: 10px; display: inline-block; left: 50%; position: absolute; text-align: center; top: 50%; transform: translate(-50%, -50%); width: 70%!important;}.iz_head_txt{font-size: 120%;}.iz_txt{color: #000; font-size: 12px; margin-top: 25px;}}@media only screen and (max-width: 800px){.iz_content{background: #fff none repeat scroll 0 0; border-radius: 10px; display: inline-block; left: 50%; position: absolute; text-align: center; top: 50%; transform: translate(-50%, -50%); width: 50%;}.iz_head_txt{font-size: 16px;font-family: "Times New Roman";}}</style><div class="iz_overlay"> <div class="iz_container"> <div class="iz_content"> <center> <div class="iz_top"> <div class="iz_head_txt"><b>Thank you for Subscribing to Shuttle Notifications!</b></div><div class="iz_txt">You will be notified when your route is live.</div></div><div style="width: 100%;height: 1px;background: #f0f0f0;margin-top: 15px;"></div><button class="iz_btn" onclick="izOpenPopup();">CLOSE</button> </center> </div></div></div>',
_izooto.unid = izSetSession();
try {
    1 == is_wp && (_izooto.pluginStatus = 1, _izooto.serviceWorker = _izooto.domainRoot + "/?izooto=sw")
} catch (a) {}
"https:" != _izooto.locationProtocol || 1 != _izooto.isChrome && 1 != _izooto.isFirefox || 1 != _izooto.isSubDomain ? 1 == _izooto.setEnr && (izSetEnr(), _log("izooto:: enr called")) : _log("izooto:: No Enr");

function izGetSessionId() {
    return "iz-" + Math.random().toString(36).substr(2, 16) + (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
}

function izSetSession() {
    var a = "";
    return a = izGetSessionId()
}

function checkIfSafari() {
    var a = window.navigator.userAgent,
        b = a.indexOf("Safari"),
        c = a.indexOf("Chrome"),
        a = a.substring(0, b).substring(a.substring(0, b).lastIndexOf("/") + 1);
    return -1 == c && 0 < b && 7 <= parseInt(a, 10) ? 1 : 0
}

function checkIfChrome() {
    var a = checkBrowser().split("-");
    return "Chrome" == a[0] && "42" <= a[1] ? 1 : 0
}

function checkIfFirefox() {
    var a = checkBrowser().split("-");
    return "Firefox" == a[0] && "44" <= a[1] ? 1 : 0
}

function _log(a) {
    1 == _izooto.debug && console.log(a)
}

function izSetEnr() {
    try {
        iframe = document.createElement("IFRAME"), iframe.setAttribute("src", _izooto.setEnrUrl + "?s=1&pid=" + _izooto.client + "&izid=" + _izooto.unid + "&btype=" + _izooto.browser + "&dtype=" + _izooto.deviceType), iframe.style.width = "0px", iframe.style.height = "0px", iframe.style.border = "0px", iframe.setAttribute("visibility", "hidden"), iframe.style.display = "none", null != document.body ? document.body.appendChild(iframe) : document.head.appendChild(iframe)
    } catch (a) {
        _log("izooto:: unable to set ENR " + a)
    }
}

function sendEnrHit(a, b, c) {
    var d = _izooto.unid;
    try {
        var f = document.createElement("img");
        f.style.width = "0px";
        f.style.height = "0px";
        "https:" == _izooto.locationProtocol ? ht = 1 : ht = 0;
        f.src = void 0 === c ? _izooto.sendEnrUrl + "?s=0&pid=" + _izooto.client + "&" + a + "=" + b + "&ht=" + ht + "&izid=" + d + "&btype=" + _izooto.browser + "&dtype=" + _izooto.deviceType : _izooto.sendEnrUrl + "?s=0&pid=" + _izooto.client + "&" + a + "=" + b + "&ht=" + ht + "&izid=" + d + "&btype=" + _izooto.browser + "&bKey=" + c + "&dtype=" + _izooto.deviceType;
        _log(f.src)
    } catch (e) {
        _log("izooto:: " +
            e)
    }
}

function checkSubDomain() {
    var a = window.location.href,
        b = 0,
        b = a.substr(a.lastIndexOf("?") + 1);
    return "action=prompt" == b ? 1 : 0
}

function izGetDevice() {
    navigator.userAgent.toLowerCase();
    return izAndroidTab() ? 2 : izIsMobile() ? 3 : 1
}

function izAndroidTab(a) {
    if (/android/.test(a)) {
        if (!1 === /mobile/.test(a)) return !0
    } else if (!0 === /ipad/.test(a)) return !0;
    return !1
}

function izIsMobile() {
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent || navigator.vendor || window.opera) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent ||
        navigator.vendor || window.opera).substr(0, 4))
}

function izGetBrowser() {
    var a = checkBrowser().split("-");
    return "Chrome" == a[0] ? 1 : "Safari" == a[0] ? 2 : "Firefox" == a[0] ? 3 : "Opera" == a[0] ? 4 : 5
}

function checkBrowser() {
    var a = navigator.userAgent,
        b = navigator.appName,
        c = "" + parseFloat(navigator.appVersion),
        d = parseInt(navigator.appVersion, 10),
        f = "",
        e, g; - 1 != (e = a.indexOf("OPR/")) ? (b = "Opera", c = a.substring(e + 4)) : -1 != (e = a.indexOf("Opera")) ? (b = "Opera", c = a.substring(e + 6), -1 != (e = a.indexOf("Version")) && (c = a.substring(e + 8))) : -1 != (e = a.indexOf("MSIE")) ? (b = "Microsoft Internet Explorer", c = a.substring(e + 5)) : -1 != (e = a.indexOf("Chrome")) ? (b = "Chrome", c = a.substring(e + 7), /(.*?)wv\)/.test(a) && (f = "22")) : -1 != (e = a.indexOf("Safari")) ?
        (b = "Safari", c = a.substring(e + 7), -1 != (e = a.indexOf("Version")) && (c = a.substring(e + 8))) : -1 != (e = a.indexOf("Firefox")) ? (b = "Firefox", c = a.substring(e + 8)) : (d = a.lastIndexOf(" ") + 1) < (e = a.lastIndexOf("/")) && (b = a.substring(d, e), c = a.substring(e + 1), b.toLowerCase() == b.toUpperCase() && (b = navigator.appName)); - 1 != (g = c.indexOf(";")) && (c = c.substring(0, g)); - 1 != (g = c.indexOf(" ")) && (c = c.substring(0, g));
    d = parseInt("" + c, 10);
    isNaN(d) && (parseFloat(navigator.appVersion), d = parseInt(navigator.appVersion, 10));
    "22" == f && (d = f);
    return b +
        "-" + d
}

function izSetCookie(a, b) {
    var c = new Date;
    c.setTime(c.getTime() + 432E8);
    c = "expires=" + c.toUTCString();
    document.cookie = a + "=" + b + "; " + c
}

function izDelCookie(a, b) {
    document.cookie = a + "=" + b + "; expires=Thu, 2 Aug 1991 20:47:11 UTC;"
}

function izDelStorage(a) {
    localStorage.removeItem(a)
}

function izGetCookie(a) {
    a += "=";
    var b = document.cookie.split(";"),
        c, d, f = b.length;
    for (c = 0; c < f; c += 1) {
        for (d = b[c];
             " " === d.charAt(0);) d = d.substring(1);
        if (-1 !== d.indexOf(a)) return d.substring(a.length, d.length)
    }
    return ""
}

function izSetStorage(a, b) {
    _izooto.isLocalStorage && localStorage.setItem(a, b);
    izSetCookie(a, b)
}

function izGetStorage(a) {
    return localStorage.getItem(a) || izGetCookie(a) ? localStorage.getItem(a) || izGetCookie(a) : ""
}

function checkSafariPermission() {
    var a = "",
        a = window.safari.pushNotification.permission(_izooto.webPushId);
    "default" === a.permission ? (_log("Prompted Safari"), sendEnrHit("prompted", "1"), requestSafariPermissions()) : "granted" === a.permission ? (a = a.deviceToken, _izooto.bkey = a, sendEnrHit("already_granted", 1, a), _log("Already Granted & key= " + a)) : "denied" === a.permission && _log("Denied")
}

function requestSafariPermissions() {
    window.safari.pushNotification.requestPermission(_izooto.webServiceUrl, _izooto.webPushId, {
        url: window.location.href
    }, function(a) {
        "granted" === a.permission ? (a = a.deviceToken, _izooto.bkey = a, sendEnrHit("allowed", "1", a), _log("Granted Key= " + a)) : "denied" === a.permission && sendEnrHit("denied", "1")
    })
}

function izClosePopWindow() {
    if (self == top) try {
        setTimeout(function() {
            window.opener.postMessage(JSON.stringify({
                k: "popclose",
                v: 1
            }), "*");
            window.close()
        }, 200)
    } catch (a) {
        log("iZooto::unable to close popup")
    }
}

function izOpenDialog() {
    var a = document.getElementsByTagName("body")[0],
        b = document.createElement("div");
    b.setAttribute("id", "middle-box");
    b.innerHTML = _izooto.dialogDesign;
    a.appendChild(b);
    izSetStorage("izState", 2)
}

function izInitialiseState() {
    "showNotification" in ServiceWorkerRegistration.prototype ? "denied" === Notification.permission ? _log("The user has blocked notifications.") : "PushManager" in window ? navigator.serviceWorker.ready.then(function(a) {
        a.pushManager.getSubscription().then(function(a) {
            a && sendSubscriptionToServer(a)
        })["catch"](function(a) {
            _log("Error during getSubscription()", a)
        })
    }) : _log("Push messaging is not supported.") : _log("Notifications are not supported.")
}

function izSubscribe() {
    navigator.serviceWorker.ready.then(function(a) {
        a.pushManager.subscribe({
            userVisibleOnly: !0
        }).then(function(a) {
            1 == _izooto.isFirefox && 1 != _izooto.ag && _log("Granted");
            return sendSubscriptionToServer(a)
        })["catch"](function(a) {
            "denied" === Notification.permission ? (1 == _izooto.isFirefox && 1 != izooto_glob.ad && ("default" != _izooto.subscriptionType || _izooto.isSubDomain ? _izooto.isSubDomain && self != top && izOnMessage("denied", "1", "parent") : sendEnrHit("denied", "1")), _log("Permission for Notification is denied")) :
                _log("Unable to subscribe to push", a)
        })
    })
}

function sendSubscriptionToServer(a) {
    a = a.endpoint;
    var b = a.substring(40);
    1 == _izooto.isFirefox && (b = a.substring(47));
    if (0 == _izooto.bkeySent) {
        if ("default" != _izooto.subscriptionType || _izooto.isSubDomain)
            if (self == top && _izooto.isSubDomain) {
                izOnMessage("bKey", b, "opener");
                try {
                    document.getElementById("dynamic_iz").innerHTML = "Subscribed"
                } catch (c) {}
                izClosePopWindow()
            } else 1 == _izooto.ag ? izOnMessage("already_granted", 1, "parent", b) : !0;
        else 1 == _izooto.ag ? sendEnrHit("already_granted", "1", b) : sendEnrHit("allowed", "1",
            b);
        _izooto.bkeySent = 1
    }
}

function izSubFrame() {
    try {
        izFrame = document.createElement("IFRAME"), izFrame.setAttribute("src", _izooto.sourceOrigin + "?action=prompt"), izFrame.style.width = "0px", izFrame.style.height = "0px", izFrame.style.border = "0px", izFrame.setAttribute("visibility", "hidden"), izFrame.style.display = "none", null != document.body ? document.body.appendChild(izFrame) : document.head.appendChild(izFrame), _log("izSubFrame set")
    } catch (a) {
        _log("izooto:: unable to subFrame" + a)
    }
}

function izCloseDialog() {
    try {
        document.getElementById("middle-box").remove(), sendEnrHit("msgclose", 1)
    } catch (a) {
        _log("Error-Removing-Div" + a)
    }
}

function izOpenPopup() {
    izCloseDialog();
    window.open(_izooto.sourceOrigin + "?action=prompt", "iZooto Subscription", "scrollbars=yes, width=200, height=200, top=" + ((window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height) / 2 - 100 + (void 0 != window.screenTop ? window.screenTop : screen.top)) + ", left=" + ((window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width) / 2 - 100 + (void 0 !=
        window.screenLeft ? window.screenLeft : screen.left)))
}

function iZootoPushNotification(a, b) {
    if ("chrome" == a) try {
        navigator.permissions.query({
            name: "notifications"
        }).then(function(a) {
            "prompt" === a.state ? ("subDomain" === b ? (console.log("Prompted Http"), izOnMessage("prompted", 1, "parent"), Notification.requestPermission()) : "default" === b && (_log("Prompted Https"), sendEnrHit("prompted", 1)), a.onchange = function() {
                "granted" === a.state ? "subDomain" === b ? (izOnMessage("allowed", 1, "parent"), _log("Granted")) : "default" === b && _log("Granted") : "denied" === a.state && ("subDomain" ===
                b ? (izOnMessage("denied", 1, "parent"), _log("Denied"), izClosePopWindow()) : "default" === b && sendEnrHit("denied", 1))
            }) : "granted" === a.state ? (_izooto.ag = 1, "subDomain" === b && _log("ag")) : "denied" === a.state && "subDomain" === b && izClosePopWindow()
        })
    } catch (c) {
        log("Unable to read notification permissions")
    } else "firefox" == a && ("Notification" in window ? "default" === Notification.permission ? "subDomain" === b ? (console.log("Prompted Http"), izOnMessage("prompted", 1, "parent"), Notification.requestPermission().then(function(a) {
        "granted" ==
        a && izOnMessage("allowed", 1, "parent")
    })) : sendEnrHit("prompted", 1) : "granted" === Notification.permission ? (_izooto.ag = 1, _log("ag_cc")) : "denied" === Notification.permission && (izClosePopWindow(), _log("ad")) : _log("This browser does not support desktop notification"));
    try {
        izSubscribe()
    } catch (c) {
        _log("Unable To Subscribe")
    }
    "serviceWorker" in navigator ? navigator.serviceWorker.register(_izooto.serviceWorker).then(izInitialiseState)["catch"](function(a) {
        _log(a)
    }) : _log("Service workers are not supported in this browser.")
}

function izOnMessage(a, b, c, d) {
    "parent" === c ? (a = void 0 === d ? {
        k: a,
        v: b
    } : {
        k: a,
        v: b,
        bkey: d
    }, window.parent.postMessage(JSON.stringify(a), "*")) : (a = void 0 === d ? {
        k: a,
        v: b
    } : {
        k: a,
        v: b,
        bkey: d
    }, window.opener.postMessage(JSON.stringify(a), "*"))
}

function izootoSubscriber(a) {
    if ("http:" === _izooto.locationProtocol) {
        if ("" != izGetStorage("iztoken")) {
            sendEnrHit("already_granted", 1, izGetStorage("iztoken"));
            return
        }
        window.onmessage = function(a) {
            -1 < _izooto.sourceOrigin.indexOf(a.origin) && a.data && (a = JSON.parse(a.data), "allowed" == a.k ? (izOpenDialog(), izSetStorage("izState", 1), izSetStorage("izid", _izooto.unid), sendEnrHit(a.k, a.v)) : void 0 != a.bkey ? (izSetStorage("iztoken", a.bkey), sendEnrHit(a.k, a.v, a.bkey)) : "popclose" == a.k ? izSetStorage("izState", 3) : ("bKey" ==
            a.k && izSetStorage("iztoken", a.v), sendEnrHit(a.k, a.v)))
        };
        izGetStorage("izState");
        izGetStorage("izid");
        izGetStorage("iztoken");
        izSubFrame()
    }
    if (1 === _izooto.isSubDomain && "https:" == _izooto.locationProtocol) {
        try {
            var b = _izooto.manifest,
                c = document.getElementsByTagName("head")[0],
                d = document.createElement("link");
            d.rel = "manifest";
            d.href = b;
            c.appendChild(d);
            _log("manifest")
        } catch (f) {}
        setTimeout(function() {
            izClosePopWindow()
        }, 1E4);
        _izooto.subscriptionType = "subDomain";
        iZootoPushNotification(a, _izooto.subscriptionType)
    } else if ("https:" ==
        _izooto.locationProtocol) {
        try {
            b = _izooto.manifest, c = document.getElementsByTagName("head")[0], d = document.createElement("link"), d.rel = "manifest", d.href = b, c.appendChild(d), _log("manifest")
        } catch (f) {}
        _izooto.subscriptionType = "default";
        iZootoPushNotification(a, _izooto.subscriptionType)
    }
}

function initIzooto() {
    1 === _izooto.izootoStatus && (_izooto.isSafari ? checkSafariPermission() : _izooto.isChrome ? izootoSubscriber("chrome") : _izooto.isFirefox && izootoSubscriber("firefox"))
}
(function() {
    3 == _izooto.deviceType ? _izooto.izootoStatus = 1 == _izooto.mobileAllowed ? 1 : 0 : 1 == _izooto.deviceType && (_izooto.izootoStatus = 1 == _izooto.desktopAllowed ? 1 : 0)
})();