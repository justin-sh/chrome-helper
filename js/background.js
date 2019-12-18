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

// add dictionary for search word
function searchDictionary(info){
    var searchstring = info.selectionText;
    chrome.tabs.create({url: "https://dictionary.cambridge.org/dictionary/english/" + searchstring})
}
chrome.contextMenus.create({title: "Cambridge Dictionary" , contexts:["selection"], onclick: searchDictionary});

// add google translation for whole sentence
function translateDictionary(info){
    var searchstring = info.selectionText;
    chrome.tabs.create({url: "https://translate.google.com.au/#view=home&op=translate&sl=en&tl=zh-CN&text=" + searchstring})
}
chrome.contextMenus.create({title: "Google Translate" , contexts:["selection"], onclick: translateDictionary});



// function triggerExchange(triggerOrNot, curTab, param) {
//     chrome.tabs.sendMessage(curTab.id, {"target": "exchange", "run": triggerOrNot, param: param}, function (response) {
//         console.log(response);
//     });
// }

// var randomIp = randomIP();
// chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
// //        var startTime = new Date().getTime();
// //        console.log('start to hack request header...');
//         var isxForward = false, isReferer = false, isuserAgent = false, isOrigin = false;
//         var _userAgent = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2;)";
//         var _url = details.url;
//         var _referUrl = "http://www.lufax.com/";
//         var _host = _url.substr(0, _url.indexOf('/', 8));
//         var _headers = details.requestHeaders;
// //        for (var j = 0; j < _headers.length; j++) {
// //            if (_headers[j].name == "X-Forward-For") {
// //                _headers[j].value = randomIp;
// //                isxForward = true;
// //            } else if (_headers[j].name == "Referer") {
// //                _headers[j].value = _referUrl;
// //                isReferer = true;
// //            } else if (_headers[j].name == "User-Agent") {
// //                _headers[j].value = _userAgent;
// //                isuserAgent = true;
// //            } else if (_headers[j].name == "Origin") {
// //                _headers[j].value = _host;
// //                isOrigin = true;
// //            }
// //        }
// //        if (isxForward == false) {
// //            _headers.push({name: 'X-Forwarded-For', value: randomIp});
// //            isxForward = true;
// //        }
// //        if (isReferer == false) {
// //            _headers.push({name: 'Referer', value: _referUrl});
// //            isxForward = true;
// //        }
// //        if (isuserAgent == false) {
// //            _headers.push({name: 'User-Agent', value: _userAgent});
// //            isxForward = true;
// //        }
// //        if (isOrigin == false) {
// //            _headers.push({name: 'Origin', value: _host});
// //            isOrigin = true;
// //        }
// //        var processTime = (new Date().getTime()) - startTime;
// //        console.log("processing time is:" + processTime);
//         return {"requestHeaders": _headers};
//     },
//     {urls: [
//         "*://*.lufax.com/*",
//         "*://ssl.google-analytics.com/*"
//     ]},
//     ["blocking", "requestHeaders"]
// );


// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         console.log(JSON.stringify(request));
//     }
// );

