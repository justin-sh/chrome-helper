String.prototype.format = function (args) {
    if (arguments.length == 0) return null;
    var args = Array.prototype.slice.call(arguments, 0);
    return this.replace(/\{(\d+)\}/g, function (m, i) {
        return args[i];
    });
}

// function sendMessage(reqest, callback) {
//     chrome.runtime.sendMessage(chrome.runtime.id, reqest, function (resp) {
//         console.log("test message resp is {0}".format(JSON.stringify(resp)));
//         typeof callback == "function" && callback(resp);
//     });
// }

// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         console.log(JSON.stringify(request));
//         if (request.target == "jifen") {
//             setTimeout(getPrdDetail, 2000);
//             sendResponse({"test": true});
//         }
//     }
// );
