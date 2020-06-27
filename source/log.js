// For show a log output by async calls.

// debug
//var console = chrome.extension.getBackgroundPage().console;

// release
var console = { log: function() {} }
