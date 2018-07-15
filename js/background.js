var triggers = {
    jifen: {},
    exchange: {},
    p2p: {}
};
var iconUrl = chrome.extension.getURL('images/lufax.png');

function popup(winId, title, message, eventTime) {
    var opt = {
        type: "basic",
        title: title,
        message: message,
        iconUrl: iconUrl
    }
    chrome.notifications.create(winId, opt, function (winId) {
        console.log("noticeId==" + winId);
        setTimeout(function () {
            chrome.notifications.clear(winId, function (wasCleared) {
                //nothing
            });
        }, eventTime || 2000);
    });
}

function warn(message) {
    popup('WARN', 'WARN', message);
}

function error(message) {
    popup('ERROR', 'ERROR', message);
}

//curTab: id / index / windowId / active / url / title / status ( loading or complete.)
//function triggerJifen(triggerOrNot, productCode, curTab) {
//    triggers.jifen["tab" + curTab.id] = { "trigger": triggerOrNot };
//    chrome.tabs.sendMessage(curTab.id, {"target": "jifen", "run": triggerOrNot}, function (response) {
//        console.log(response);
//    });
//}

function triggerExchange(triggerOrNot, curTab, param) {
    console.log("triggerExchange...start...." + JSON.stringify(param));
    triggers.exchange["tab" + curTab.id] = { "trigger": triggerOrNot, tabId: curTab.id, winId: curTab.windowId};
    chrome.tabs.sendMessage(curTab.id, {"target": "exchange", "run": triggerOrNot, param: param}, function (response) {
        console.log(response);
    });
}
function triggerP2PInvest(triggerOrNot, curTab, amount, pageLimit, passwd) {
    console.log("triggerP2PInvest...start....amount= " + amount);
    triggers.p2p["tab" + curTab.id] = { "trigger": triggerOrNot };
    chrome.tabs.sendMessage(curTab.id, {"target": "p2p", "run": triggerOrNot, "amount": amount, passwd: passwd, "pageLimit": pageLimit}, function (response) {
        console.log(response);
    });
}

function randomIP() {
    randomIp = "" + Math.floor(Math.random() * 225);
    randomIp += '.' + Math.floor(Math.random() * 225);
    randomIp += '.' + Math.floor(Math.random() * 225);
    randomIp += '.' + Math.floor(Math.random() * 225);
    return randomIp;
}

var randomIp = randomIP();
chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
//        var startTime = new Date().getTime();
//        console.log('start to hack request header...');
        var isxForward = false, isReferer = false, isuserAgent = false, isOrigin = false;
        var _userAgent = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2;)";
        var _url = details.url;
        var _referUrl = "http://www.lufax.com/";
        var _host = _url.substr(0, _url.indexOf('/', 8));
        var _headers = details.requestHeaders;
//        for (var j = 0; j < _headers.length; j++) {
//            if (_headers[j].name == "X-Forward-For") {
//                _headers[j].value = randomIp;
//                isxForward = true;
//            } else if (_headers[j].name == "Referer") {
//                _headers[j].value = _referUrl;
//                isReferer = true;
//            } else if (_headers[j].name == "User-Agent") {
//                _headers[j].value = _userAgent;
//                isuserAgent = true;
//            } else if (_headers[j].name == "Origin") {
//                _headers[j].value = _host;
//                isOrigin = true;
//            }
//        }
//        if (isxForward == false) {
//            _headers.push({name: 'X-Forwarded-For', value: randomIp});
//            isxForward = true;
//        }
//        if (isReferer == false) {
//            _headers.push({name: 'Referer', value: _referUrl});
//            isxForward = true;
//        }
//        if (isuserAgent == false) {
//            _headers.push({name: 'User-Agent', value: _userAgent});
//            isxForward = true;
//        }
//        if (isOrigin == false) {
//            _headers.push({name: 'Origin', value: _host});
//            isOrigin = true;
//        }
//        var processTime = (new Date().getTime()) - startTime;
//        console.log("processing time is:" + processTime);
        return {"requestHeaders": _headers};
    },
    {urls: [
        "*://*.lufax.com/*",
        "*://ssl.google-analytics.com/*"
    ]},
    ["blocking", "requestHeaders"]
);

//chrome.tabs.onActivated.addListener(function (activeInfo) {
////    triggers.exchange["tab"]
//    for( e in  triggers.exchange){
//     if(triggers.exchange[e].tabId == activeInfo.tabId){
//         triggers.exchange[e].current = true;
//     }else{
//         triggers.exchange[e].current = false;
//     }
//    }
//});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(JSON.stringify(request));
//        if (request.url == "test") {
//            console.log("bankgroud on message is ok!!!!!!!!!!!!!!!" + new Date().toLocaleString());
//            sendResponse({"test": "OK"});
//        } else
        if (request.target == 'p2p.trace') {

            sendSteps(request.param, sender.tab.id);

            sendResponse({target: 'p2p.trace', result: 'processing'});

        } else if (request.target == 'p2p.image.refresh') {
            getImageId(request.param, sender.tab.id)

            sendResponse({target: 'p2p.image.refresh', result: 'processing'});

        } else if (request.target == 'p2p.invest') {
            submitInvest(request.param, sender.tab.id)

            sendResponse({target: 'p2p.invest', result: 'processing'});
        } else if (request.target == 'exchange.submit') {
            var tabId = sender.tab.id;
            var winId = sender.tab.windowId;
            var nextTabId = -1, nextWinId = -1;
            for (e in  triggers.exchange) {
                if (tabId == triggers.exchange[e].tabId) {
                    triggers.exchange[e].triggered = true;
                    continue;
                }
                if (triggers.exchange[e].triggered) {
                    continue;
                }
                if (nextTabId == -1) {
                    nextTabId = triggers.exchange[e].tabId;
                    nextWinId = triggers.exchange[e].winId;
                }
            }

            if (nextTabId != -1) {
                if (winId == nextWinId) {
                    chrome.tabs.update(nextTabId, {active: true}, function (tab) {

                    });
                } else {
                    chrome.windows.update(nextWinId, {focused: true}, function (window) {
                        chrome.tabs.update(nextTabId, {active: true}, function (tab) {

                        });
                    });
                }
            }

            sendResponse({target: 'exchange.submit', result: 'OK'});
        } else {
        }
    }
);

//TRADE_INFO-->CONTRACT
function sendSteps(param, tabId) {
    $.post('https://trading.lufax.com/trading/service/trade/trace', param).done(function (d) {
//        if (d.result) {
        if (param.curStep == 'TRADE_INFO') {
            param.curStep = 'CONTRACT';
            sendSteps(param, tabId);
        } else if (param.curStep == 'CONTRACT') {
//                param.curStep = 'OTP';
//                sendSteps(param);
            getImageId({sid: param.sid, productId: param.productId}, tabId);
        } else if (param.curStep == 'OTP') {
            param.curStep = 'OTP';
            sendSteps(param, tabId);
        } else {

        }
//        } else {
//            console.warn('send trace result not true!');
//            msgCallback({errorMsg: 'send trace failed!' + err});
//        }
    }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.warn("p2pTradeInfo Failed: " + err + " param:" + JSON.stringify(param));
//            setTimeout(investCheck, 100);
            msgCallback({errorMsg: 'send trace failed!' + err});
        });
}

/*generateCoinString:function () {
 var selectedCoin = "";
 $("input[name=coinNum]").each(function () {
 if ($(this).prop("checked") == true) {
 if (selectedCoin.length == 0) {
 selectedCoin = selectedCoin + $(this).attr("data-coin-num")
 }
 else {
 selectedCoin = selectedCoin + "|" + $(this).attr("data-coin-num");
 }

 }
 });
 return selectedCoin;
 },

 encryptPwd:function (pwd) {
 var PublicKey = "BE24E372DC1B329633A6A014A7C02797915E3C363DD6EE119377BD645329B7E6446B4A71AC5F878EBC870C6D8BFD3C06B92E6C6E93390B34192A7A9E430800091761473FAC2CC0A68A828B2589A8CB729C19161E8E27F4C0F3CDE9701FAFE48D2B65947799072AFA6A3F2D7BDBEF8B6D7429C2D115A3E5F723467D57B3AC6967";
 var RSA = new RSAKey();
 RSA.setPublic(PublicKey, "10001");
 return RSA.encrypt(pwd)
 },


 if (data.code === "17") {
 $("#pwd-tip").hide();
 security.showError('.tradeCode', data.message);
 $("#validBtn").removeClass("disabled").addClass("validBtn");
 } else if (data.code === "18") {
 security.lockedPrompt(data);
 } else {
 $("#resultCode").val(data.code);
 $("#encodeProductId").val(data.encodeProductId);
 $("#trxId").val(data.trxId);
 $("#result").submit();
 }


 */

function submitInvest(param, tabId) {
    $.post('https://trading.lufax.com/trading/users/' + param.userId + '/investment-request', {productId: param.productId, password: param.password, captcha: param.captcha, sid: param.sid, source: 0, coinString: param.coinString, imgId: param.imageId})
        .done(function (data) {
            if (data.code == 17 || data.code == 18) {
                //fail todo
            } else {

                chrome.tabs.sendMessage(tabId, {"target": "p2p.result", resultCode: d.code, trxId: d.trxId, encodedProductId: d.encodedProductId}, function (response) {
                    console.log(response);
                });

//                $.post('https://trading.lufax.com/trading/result', {productId: param.productId, sid: param.sid, resultCode: data.code, trxId: data.trxId, encodedProductId: data.encodedProductId})
//                    .done(function (d) {
//
//                    })
//                    .fail(function (jqxhr, textStatus, error) {
//                        var err = textStatus + ", " + error;
//                        console.warn("p2p submitInvest Failed: " + err + " param:" + JSON.stringify(param));
//                        setTimeout(function () {
//
//                        }, 100);
//                    });
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.warn("p2p submitInvest Failed: " + err + " param:" + JSON.stringify(param));
            setTimeout(function () {
//                getImageId(param) todo
            }, 100);
        });
}

function getImageId(param, tabId) {
    $.post('https://trading.lufax.com/trading/service/trade/captcha/create-captcha', {sid: param.sid, productId: param.productId})
        .done(function (d) {
//        msgCallback(d);
            chrome.tabs.sendMessage(tabId, {"target": "p2p.image", imageId: d.imageId}, function (response) {
                console.log(response);
            });
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.warn("p2pTradeInfo Failed: " + err + " param:" + JSON.stringify(param));
            setTimeout(function () {
                getImageId(param)
            }, 100);
        });

}

