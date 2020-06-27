'use strict';


var sequenceData = {};


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log(request);
    if (request.name === "setSequenceData") {
        sequenceData = request.sequenceData;
        sendResponse({
            status: "success",
        });
        return;
    }

    if (request.name === "getSequenceData") {
        sendResponse({
            sequenceData: sequenceData,
            status: "success"
        });
        return;
    }
});
