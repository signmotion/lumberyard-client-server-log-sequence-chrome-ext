var thisTab;


/// Fixed an error in Chrome.
/// \thanks https://stackoverflow.com/a/56787332/963948
function sendMessage(msg, callback) {
    chrome.runtime.sendMessage(msg, response => {
        if (chrome.runtime.lastError) {
            setTimeout(function() {
                sendMessage(msg);
            }, 1000);
        } else {
            // background script is ready now
            callback(response);
        }
    });
}


function getTabObj(callback) {
  chrome.tabs.getSelected(window.id, function(tab) {
    thisTab = tab;
    callback();
  });
}


function isValidDate(d) {
    //return d instanceof Date && !isNaN(d);
    return !isNaN(d);
}
