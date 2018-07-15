$(function () {
    (function () {
        chrome.windows.getCurrent(function (win) {
            chrome.tabs.query({"active": true, "windowId": win.id}, function (tabs) {
                var curTab = tabs[0];

                var triggers = chrome.extension.getBackgroundPage().triggers;

                if (curTab.url.indexOf('//points.lufax.com/points/exchange/product') >= 0) {
                    triggers.exchange["tab" + curTab.id] = triggers.exchange["tab" + curTab.id] || {};
                    if (triggers.exchange["tab" + curTab.id].trigger) {
                        $('#exchange button').html("Trigger Stop");
                    } else {
                        $('#exchange button').html("Trigger Start");
                    }
                } else if (curTab.url.indexOf('//list.lufax.com/list/listing') >= 0) {
                    triggers.p2p["tab" + curTab.id] = triggers.p2p["tab" + curTab.id] || {};
                    if (triggers.p2p["tab" + curTab.id].trigger) {
                        $('#p2p button').html("Trigger Stop");
                    } else {
                        $('#p2p button').html("Trigger Start");
                    }
                } else {
                    //do nothing because of not support this page's function
                }
            })
        })
    })();

    $("#exchange button").click(function () {
        chrome.windows.getCurrent(function (win) {
            chrome.tabs.query({"active": true, "windowId": win.id}, function (tabs) {
                var curTab = tabs[0];
                if (curTab.url.indexOf('//points.lufax.com/points/exchange/product') == -1) {
                    chrome.extension.getBackgroundPage().warn("不适用这个页面");
                    return;
                }
                var triggers = chrome.extension.getBackgroundPage().triggers;
                var triggerOrNot = false;
                if (triggers.exchange["tab" + curTab.id].trigger) {
                    $("#exchange button").html("Trigger Start");
                    triggerOrNot = false;
                } else {
                    $("#exchange button").html("Trigger Stop");
                    triggerOrNot = true;
                }
                var pParam = {
                    receiverName: $('#receiverName').val(), mobile: $('#mobile').val(), address: $('#address').val(), postCode: $('#postCode').val()
                };
                chrome.extension.getBackgroundPage().triggerExchange(triggerOrNot, curTab, pParam);
                window.close();
            });
        });
    });

    $("#p2p button").click(function () {
        chrome.windows.getCurrent(function (win) {
            chrome.tabs.query({"active": true, "windowId": win.id}, function (tabs) {
                var curTab = tabs[0];
                if (curTab.url.indexOf('https://list.lufax.com/list/listing') == -1) {
                    chrome.extension.getBackgroundPage().warn("不适用这个页面");
                    return;
                }
                var triggers = chrome.extension.getBackgroundPage().triggers;
                var triggerOrNot = false;
                if (triggers.p2p["tab" + curTab.id].trigger) {
                    $("#p2p button").html("Trigger Start");
                    triggerOrNot = false;
                } else {
                    $("#p2p button").html("Trigger Stop");
                    triggerOrNot = true;
                }
                chrome.extension.getBackgroundPage().triggerP2PInvest(triggerOrNot, curTab, $("#p2p input.amount").val(), $("#p2p input.pageLimit").val(), $("#tradePasswd").val());
                window.close();
            });
        });
    });

    $("#test button").click(function () {
        chrome.extension.getBackgroundPage().warn("warn test");
    });

    $("#randomBtn").click(function () {
        chrome.extension.getBackgroundPage().randomIP();
    });
});
