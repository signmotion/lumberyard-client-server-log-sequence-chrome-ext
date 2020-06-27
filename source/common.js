var thisTab;


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
