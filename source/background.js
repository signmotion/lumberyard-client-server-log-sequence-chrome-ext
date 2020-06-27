'use strict';

chrome.runtime.onInstalled.addListener(function() {
  console.log("Start plugin.");
});


var sequenceData = {};


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  console.log(request);
  if (request.name === "setSequenceData") {
    sequenceData = request.sequenceData;
    sendResponse({
      status: "success",
    });

  } else if (request.name === "getSequenceData") {
    sendResponse({
      sequenceData: sequenceData,
      status: "success"
    });
  }
});
