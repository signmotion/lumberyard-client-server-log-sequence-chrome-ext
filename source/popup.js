var currentCharCode;

var firstTab;
var firstFileContent;

var secondTab;
var secondFileContent;

var tabList = [];


window.onload = function() {

    console.log('window.onload()');
    async.series([
            function(callback) {
                $("#h2-1").html(chrome.i18n.getMessage("popup_header"));
                $("#main").hide();
                callback();
            },

            function(callback) {
                getTabObj(callback);
            },

            function(callback) {
                // active tab includes
                chrome.tabs.query({}, function(tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i];
                        if (tab.url.indexOf(".log") !== -1) {
                            tabList.push(tab);
                        }
                    }
                    console.log(tabList);
                    callback();
                });
            },

            function(callback) {
                chrome.tabs.sendMessage(
                    thisTab.id,
                    {
                        name: "getCharCode",
                    },
                    function(response) {
                        console.log(response);
                        if (response === undefined) {
                            // ignore this error: work with plain text (log) files
                            callback();
                        } else {
                            currentCharCode = response.charCode;
                            callback();
                        }
                    });
            },

            function(callback) {
                console.log('will open immediately a merged log then have 2 logfiles');
                $("#messageNote").html(
                    chrome.i18n.getMessage("popup_message_need_open_2_tabs"));
                // will open immediately a merged log then have 2 logfiles
                if (tabList.length === 2) {
                    // open immediately
                    firstTab = tabList[0];
                    secondTab = tabList[1];
                    console.log('tabs');
                    console.log(firstTab);
                    console.log(secondTab);
                    sequenceShow();
                }
                else {
                    // show help message
                    $("#messageNote").html(
                      chrome.i18n.getMessage("popup_message_need_open_2_tabs"));
                }
                callback();
            }
        ],

        function(err, results) {
            console.log('err' + err);
            if (err) {
              var msg = chrome.i18n.getMessage("popup_error");
              if (err === "unsupportedReload") {
                  msg = chrome.i18n.getMessage("sequence_error_doReload");
              }
              $("#errorNote").html(
                  '<div id="errorMsg" class="unsupported">' +
                    msg + '<br>' + results +
                  '</div>');
              $("#errorDiv").show();
              $("#messageNote").hide();
              $("#tabsDiv").hide();
              $("#h2-1").hide();
            }
            setTimeout(() => $("#main").show(), 48);
        });
};


function sequenceShow() {

    console.log('sequenceShow()');
    async.series([
            function(callback) {
                var sequenceData = {
                    currentTab: thisTab,
                    firstUrl: firstTab.url,
                    secondUrl: secondTab.url,
                    currentCharCode: currentCharCode
                };
                chrome.runtime.sendMessage({
                    name: "setSequenceData",
                    sequenceData: sequenceData
                }, function(response) {
                    if (response) {
                        callback();
                    } else {
                        callback("Error when sendMessage().");
                    }
                });
            },

            function(callback) {
                chrome.tabs.create({
                    index: thisTab.index + 1,
                    url: "sequence.html"
                });
                callback();
            }
        ],

        function(err, results) {
            if (err) {
                window.alert(chrome.i18n.getMessage("popup_error") + '\n' + err);
                throw err;
            }
        });
}
