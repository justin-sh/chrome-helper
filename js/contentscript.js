String.prototype.format = function (args) {
    if (arguments.length == 0) return null;
    var args = Array.prototype.slice.call(arguments, 0);
    return this.replace(/\{(\d+)\}/g, function (m, i) {
        return args[i];
    });
}

var runStatus = {
    "jifen": { "run": false},
    "exchange": { "run": false},
    "p2p": { "run": false}
};

function sendMessage(reqest, callback) {
    chrome.runtime.sendMessage(chrome.runtime.id, reqest, function (resp) {
        console.log("test message resp is {0}".format(JSON.stringify(resp)));
        typeof callback == "function" && callback(resp);
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(JSON.stringify(request));
        if (request.target == "jifen") {
            setTimeout(getPrdDetail, 2000);
            sendResponse({"test": true});
        } else if (request.target == "exchange") {
            runStatus["exchange"].run = request.run;
            if (request.run) {
                couldExchangeParams['productCode'] = $("#productCode").val();
                couldExchangeParams['stepId'] = $("#stepId").val();

                sendExchangeParam["productCode"] = $('#productCode').val();
                sendExchangeParam["stepId"] = $('#stepId').val();

                var productType = $('#productType').val();
                if (productType == 'PHYSICAL') {
                    sendExchangeParam["name"] = request.param.receiverName || '';
                    sendExchangeParam["mobile"] = request.param.mobile || '';
                    sendExchangeParam["address"] = request.param.address || '';
                    sendExchangeParam["postCode"] = request.param.postCode || '';
                } else {
                    sendExchangeParam["name"] = '';
                    sendExchangeParam["mobile"] = '';
                    sendExchangeParam["address"] = '';
                    sendExchangeParam["postCode"] = '';
                }

                preLoadValidationCodeImage();

                if ($("#if" + couldExchangeParams.productCode).length == 0) {
                    $('.main-wrap').prepend('<iframe width="500px" height="20px" name="if' + couldExchangeParams.productCode + '" id="if' + couldExchangeParams.productCode + '"></iframe>');
//                    $('#investForm').attr("action", "https://my.lufax.com/my/account");
                    $('#investForm').attr("target", "if" + couldExchangeParams.productCode);
                }

                setTimeout(exchangeMiaosha, 200);
            }
            sendResponse({"target": "exchange", "run": true});
        } else if (request.target == "p2p") {
            runStatus["p2p"].run = request.run;
            runStatus["p2p"].amount = availableAmount = request.amount;
            runStatus["p2p"].pageLimit = pageLimit = request.pageLimit;
            p2pParam.originPwd = request.password;

            var resultForm = '<form id="__investResult" action="https://trading.lufax.com/trading/result" method="post">'
                + '<input type="hidden" id="__productId" name="productId" value="">'
                + '<input type="hidden" name="__sid" id="sid" value="">'
                + '<input id="__resultCode" type="hidden" name="resultCode">'
                + '<input id="__encodeProductId" type="hidden" name="encodeProductId">'
                + '<input id="__trxId" type="hidden" name="trxId">'
                + '</form>';

            if ($("#__investResult").length > 0) {
                $("#__investResult").remove();
            } else {
                $("body").prepend(resultForm);
            }

            if (request.run) {
                setTimeout(p2pInvest, 200);
            }
            sendResponse({"target": "exchange", "run": true});
        } else if (request.target == 'p2p.image') {
            console.log("p2p image...................")
            p2pParam.imageId = request.imageId;
            getInvestImage();
            sendResponse({"target": "p2p.image"});
        } else if (request.target == 'p2p.result') {
            p2pParam.code = request.code;
            p2pParam.trxId = request.trxId;
            p2pParam.encodedProductId = request.encodedProductId;
            investResult();
            sendResponse({"target": "p2p.result"});
        } else {
        }
    }
);

var prdCode = $("#productCode").val();
//var prdName = $("#acuteProductName").val();
//
//var prdDetailUrl = location.origin + "/points/service/points/get-auction-product";

//function getPrdDetail() {
//    $.getJSON(prdDetailUrl, {"productCode": prdCode},
//        function (result) {
//            var auctionPrice = result.currentAuctionTopPrice + result.auctionStepPrice;
//            console.log(auctionPrice);
//            console.log(JSON.stringify(result));
//        }).fail(function (jqxhr, textStatus, error) {
//            var err = textStatus + ", " + error;
//            console.log("Request Failed: " + err);
//            setTimeout(getPrdDetail, 100);
//        });
//}

//function investCheck() {
//    var param = {};
//    param["stepId"] = $("#stepId").val();
//    param["productCode"] = prdCode;
//    param["auctionPrice"] = auctionPrice;
//}

var request_url = {
    getServerTime: "https://points.lufax.com/points/service/points/get-server-time",
    userInfo: "https://points.lufax.com/points/service/points/get-user-info",
    isUserSignIn: "https://points.lufax.com/points/service/points/is-user-sign-in",
    userSignIn: "https://points.lufax.com/points/service/points/sign-in",
    auctionTopList: "https://points.lufax.com/points/service/points/get-auction-top-list",
    exchangePreviewList: "https://points.lufax.com/points/service/points/get-exchange-preview-list",
    vipExchangePreviewList: "https://points.lufax.com/points/service/points/get-exchange-vip-preview-list",
    productPreviewList: "https://points.lufax.com/points/service/points/get-product-preview-list",
    getExchangeProduct: "https://points.lufax.com/points/service/points/get-exchange-product",
    getAcutionProduct: "https://points.lufax.com/points/service/points/get-auction-product",
    getAcutionProductTopHistory: "https://points.lufax.com/points/service/points/get-auction-product-top-history",
    couldExchangeProduct: "https://points.lufax.com/points/service/points/could-exchange-product",
    couldAuctionProduct: "https://points.lufax.com/points/service/points/could-auction-product",
    sendExchangeProductRequest: "https://points.lufax.com/points/service/points/send-exchange-product-request",
    sendAuctionProductRequest: "https://points.lufax.com/points/service/points/send-auction-product-request",
    sendAuctionNotificationRequest: "https://points.lufax.com/points/service/points/send-auction-notification-request",
    getLastUserAddressInfo: "https://points.lufax.com/points/service/points/get-last-user-address-info",
    requestInfo: "https://points.lufax.com/points/service/points/get-exchange-trade-request-info",
    userChoiceBankUrl: "https://user.lufax.com/user/choiceBank",
    pointsHomePage: "https://points.lufax.com/points",
    listsHost: "https://list.lufax.com/list",
    listUrl: "https://list.lufax.com/list/service/product/listing/1?maxInstalments=240&column=&order=asc&isDefault=true"
};


//https://points.lufax.com/points/exchange/product?productCode=201403080001
//============================积分兑换抢拍============================================
var couldExchangeParams = {};
couldExchangeParams['productCode'] = $("#productCode").val();
couldExchangeParams['stepId'] = $("#stepId").val();

var sendExchangeParam = {};
sendExchangeParam["productCode"] = $('#productCode').val();
sendExchangeParam["stepId"] = $('#stepId').val();
//sendExchangeParam["name"] = $('#receiverName').val();
//sendExchangeParam["mobile"] = $('#mobile').val();
//sendExchangeParam["address"] = $('#address').val();
//sendExchangeParam["postCode"] = $('#postCode').val();

var validationCode = {};

function sendExchange() {
    if (!runStatus["exchange"].run) {
        return;
    }

    if (!sendExchangeParam.inputValue) {
        console.warn('validation code not input!')
//        setTimeout(arguments.callee, 10);
        return;
    }

    $.post(request_url.sendExchangeProductRequest, sendExchangeParam,function (data) {
//        console.log("request_url.sendExchangeProductRequest==" + JSON.stringify(data));
        if (data.result === "00") {
            $('#tradeRequestId').val(data.tradeRequestId);
            $('#investForm').submit();
        } else if (parseInt(data.result) <= 6) {
            //exchange over
            console.warn("exchange over! ");
        } else {
            setTimeout(sendExchange, 100);
        }
    }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
            setTimeout(sendExchange, 100);
        });
}

function exchangeMiaosha() {
    if (!runStatus["exchange"].run) {
        return;
    }

    $.getJSON(request_url.couldExchangeProduct, couldExchangeParams,
        function (data) {
            console.log("request_url.couldExchangeProduct==" + JSON.stringify(data));
            if (data.result === "00") {

                productValidationCode();
//                sendExchange();
            } else if (parseInt(data.result) <= 6) {
                //exchange over
                console.warn("exchange over! ");
            }else if (data.result == '09'){
                productValidationCode();
            } else {
                setTimeout(exchangeMiaosha, 10);
            }
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
            setTimeout(exchangeMiaosha, 100);
        });
}

//add image code
function productValidationCode() {

    validationCode.sid = '';
    sendExchangeParam.inputValue = '';
    $('#_validationCode').val('');

    $.getJSON("https://points.lufax.com/points/service/points/create-captcha?productCode={0}&_={1}".format(couldExchangeParams.productCode, +new Date))
        .done(function (d) {
            if (d.result == '00') {
                //{"sid":"dff267b7a85c42cf8eaa98877d76c509","result":"00","imageId":"0542c878d62f452bb92c4cf9e3349ee9","source":"g"}
                validationCode.sid = d.sid;
                validationCode.imageId = d.imageId;
                validationCode.source = d.source;

                sendExchangeParam["sid"] = validationCode.sid;
                sendExchangeParam["imageId"] = validationCode.imageId;
                sendExchangeParam["source"] = validationCode.source;

                $('#_validationCodeImg').attr('src', "https://user.lufax.com/user/captcha/get-captcha.jpg?source={0}&imageId={1}".format(validationCode.source, validationCode.imageId))
            } else {
                setTimeout(productValidationCode, 100);
            }
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
            setTimeout(productValidationCode, 100);
        });
}

function preLoadValidationCodeImage() {

    if ($('#_validationCodeImg').length > 0) {
        return;
    }

    $(".main-wrap").prepend('<img id="_validationCodeImg" src="{0}" ><input id="_validationCode" style="margin-left: 10px;font-size: 30px" maxlength="4" size="4" height="20px" width="150px">'.format(chrome.extension.getURL('images/pre_loading.jpg')));
    $(".main-wrap").on("keyup", "#_validationCode", function () {
        if ($('#_validationCode').val().length == 4) {
            sendExchangeParam["inputValue"] = $("#_validationCode").val();
            //do change tab
            chrome.runtime.sendMessage(chrome.runtime.id, {target: 'exchange.submit'}, function (resp) {
                console.log("test message resp is {0}".format(JSON.stringify(resp)));
            });
            sendExchange();
        }
    });
    $(".main-wrap").on("click", "#_validationCodeImg", function () {
        productValidationCode();
    });
    $('body').click(function () {
        $('#_validationCode').get(0) && $('#_validationCode').get(0).focus();
    });
    $('#_validationCode').get(0) && $('#_validationCode').get(0).focus();
}

//============================积分兑换抢拍============================================

//===========================p2p =====================================================
var availableAmount = 0;
var pageLimit = 50;
var p2pParam = {};
function p2pInvest() {
    if (!runStatus["p2p"].run) {
        return;
    }
    $.getJSON('{0}&minAmount={1}&maxAmount=100000&pageLimit={2}&_={3}'.format(request_url.listUrl, 0, pageLimit, +new Date),
        function (resp) {
            console.log(resp.data.length);
            //do filter:only show could be invest
            var data = resp.data;
            var showData = [];

            var dataLen = data.length;
            for (var i = 0; i < data.length; i++) {
                var e = data[i];
                //invest done
                if (e.productStatus == 'DONE' || e.productStatus == 'PREVIEW') {
                    continue;
                }
                //isForNewUser
                if (e.isForNewUser) {
                    continue;
                }
                //an ye dai
                if (e.productCategory == '903') {
                    continue;
                }
                //bit
                if (e.tradingMode == '06') {
                    continue;
                }
                //最小投资额大于可用余额
                if (!e.currentPrice) {
                    console.warn("maybe list update version!!pls check it! min invest amount is null");
                } else {
                    if (e.currentPrice > availableAmount) {
                        continue;
                    }
                }

                //tradingMode == '07' RAISE 募集方式  '00' 普通P2P
                showData.push(e);
            }

            if (showData.length == 0) {
                setTimeout(p2pInvest, 100);
                return;
            }
            console.log(showData);

            console.log("do invest....");
//            var productId = showData[0].productId;
            p2pParam.productId = showData[0].productId;
            p2pParam.userId = $('#userId').val();

            var PublicKey = "BE24E372DC1B329633A6A014A7C02797915E3C363DD6EE119377BD645329B7E6446B4A71AC5F878EBC870C6D8BFD3C06B92E6C6E93390B34192A7A9E430800091761473FAC2CC0A68A828B2589A8CB729C19161E8E27F4C0F3CDE9701FAFE48D2B65947799072AFA6A3F2D7BDBEF8B6D7429C2D115A3E5F723467D57B3AC6967";
            var RSA = new RSAKey();
            RSA.setPublic(PublicKey, "10001");
            p2pParam.password = RSA.encrypt(pwd);

            var raiseAmount = showData[0].minInvestAmount;
            if (availableAmount >= showData[0].remainingAmount) {
                raiseAmount = showData[0].remainingAmount;
            }
            p2pParam.raiseAmount = raiseAmount;

            investCheck();
        }
    ).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
            setTimeout(p2pInvest, 100);
        });
}

function investCheck() {
    if (!runStatus["p2p"].run) {
        return;
    }
    $.post(request_url.listsHost + "/service/users/" + p2pParam.userId + "/products/" + p2pParam.productId + "/invest-check", {amount: p2pParam.raiseAmount, source: "0"},
        function (data) {
            if (data.code == "66" || data.code == "04") {
                p2pParam.sid = data.sid;
                var checkStepsParam = {sid: data.sid || Math.floor(Math.random() * 1000), curStep: "TRADE_INFO", amount: p2pParam.raiseAmount, productId: p2pParam.productId};

                chrome.runtime.sendMessage(chrome.runtime.id, {target: 'p2p.trace', param: checkStepsParam}, function (resp) {
                    console.log("test message resp is {0}".format(JSON.stringify(resp)));
                });

            } else {
                console.log("Request invest check Failed: errCode=" + data.code);
                setTimeout(investCheck, 100);
            }
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request invest check Failed: " + err);
            setTimeout(investCheck, 100);
        });
}

function getInvestImage() {
    if ($('#_validationCodeImg').length == 0) {
        $(".main-wrap").prepend('<img id="_validationCodeImg" src="https://user.lufax.com/user/captcha/get-captcha.jpg?source={0}&imageId={1}" ><input id="_validationCode">'.format("1", p2pParam.imageId));
        $(".main-wrap").on("keyup", "#_validationCode", function () {
            if ($('#_validationCode').val().length == 4) {
                p2pParam["captcha"] = $("#_validationCode").val();
                p2pParam.coinString = '';//todo when has coin
                chrome.runtime.sendMessage(chrome.runtime.id, {target: 'p2p.invest', param: p2pParam}, function (resp) {
                    console.log("response of invest submit:{0}".format(JSON.stringify(resp)));
                });
            }
        });
        $(".main-wrap").on("click", "#_validationCodeImg", function () {
            p2pParam.imageId = '';
            chrome.runtime.sendMessage(chrome.runtime.id, {target: 'p2p.image.refresh', param: {sid: p2pParam.sid, productId: p2pParam.productId}}, function (resp) {
                console.log("response of refresh invest validation image:{0}".format(JSON.stringify(resp)));
            });
        });
        $('body').click(function () {
            $('#_validationCode').get(0) && $('#_validationCode').get(0).focus();
        });
    } else {
        $('#_validationCodeImg').attr('src', "https://user.lufax.com/user/captcha/get-captcha.jpg?source={0}&imageId={1}".format("1", p2pParam.imageId))
    }
}

function investResult() {
//    var resultForm = '<form id="__investResult" action="https://trading.lufax.com/trading/result" method="post">'
//        + '<input type="hidden" id="__productId" name="productId" value="">'
//        + '<input type="hidden" name="__sid" id="sid" value="">'
//        + '<input id="__resultCode" type="hidden" name="resultCode">'
//        + '<input id="__encodeProductId" type="hidden" name="encodeProductId">'
//        + '<input id="__trxId" type="hidden" name="trxId">'
//        + '</form>';

    $("#__productId").val(p2pParam.productId);
    $("#__sid").val(p2pParam.sid);
    $("#__resultCode").val(p2pParam.resultCode);
    $("#__encodeProductId").val(p2pParam.encodedProductId);
    $("#__trxId").val(p2pParam.trxId);

    $("#__investResult").submit();
}

//===========================p2p =====================================================