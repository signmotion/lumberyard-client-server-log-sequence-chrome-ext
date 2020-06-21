var currentCharCode;

var firstUrl;
var firstFileContent;

var secondUrl;
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
                firstUrl = thisTab.url;
                console.log("firstUrl " + firstUrl);
                chrome.tabs.query({}, function(tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i];
                        if (!tab.active && tab.url.indexOf(".log") !== -1) {
                            tabList.push(tab);
                        }
                    }
                    console.log(tabList);
                    callback();
                });
            },

            function(callback) {
                for (var i = 0; i < tabList.length; i++) {
                    var tab = tabList[i];
                    var tabDiv = '<div class="tabDiv">';
                    tabDiv += '<div class="tabTitleDiv">';
                    tabDiv += '<div class="tabImgDiv"><img src="' + tab.favIconUrl + '"></div>';
                    tabDiv += tab.title + '</div>';
                    tabDiv += '<div class="tabUrlDiv">' + tab.url + '</div>';
                    tabDiv += '<div class="clear"></div></div>';
                    $("#tabsDiv").append(tabDiv);
                }
                callback();
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
            }
        ],

        function(err, results) {
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
              $("#tabsDiv").hide();
              $("#h2-1").hide();
            }
            setTimeout('$("#main").show()', 48);
        });
};


function openSite() {

    async.series([
            function(callback) {
                chrome.tabs.create({
                    index: thisTab.index + 1,
                    url: secondUrl
                });
                callback();
            }
        ],

        function(err, results) {
            if (err) {
                throw err;
            }

            console.log('Series all done. ' + results);
            $("body").html("Loaded");
        });
}


function sequenceShow(o) {

    console.log('sequenceShow()');
    async.series([
            function(callback) {
                var sequenceData = {
                    currentTab: thisTab,
                    firstUrl: firstUrl,
                    secondUrl: o.otherUrl,
                    currentCharCode: currentCharCode
                };
                chrome.runtime.sendMessage({
                    name: "setSequenceData",
                    sequenceData: sequenceData
                }, function(response) {
                    if (response) {
                        callback();
                    } else {
                        callback("Error when chrome.runtime.sendMessage().");
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


$(document).on("click", ".tabDiv", function() {

    console.log($(this).find('.tabUrlDiv').text());
    sequenceShow({
        otherUrl: $(this).find('.tabUrlDiv').text()
    });
});
