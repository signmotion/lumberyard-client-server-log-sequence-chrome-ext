var sequenceData = {};

var firstFileName;
var firstFileContent;
var successGetFirstFile = false;
var firstSource;

var secondFileName;
var secondFileContent;
var successGetSecondFile = false;
var secondSource;

var charCode;

var ROW_SEPARATOR = '\n';
var DATETIME_SEPARATOR = '> ';


window.onload = function() {

    async.series([
            function(callback) {
                $('#annotation').css("visibility", "visible");
                $('#htmlLeftTitle').css("visibility", "hidden");
                $('#htmlRightTitle').css("visibility", "hidden");
                callback();
            },

            function(callback) {
                getTabObj(callback);
            },

            function(callback) {
                chrome.runtime.sendMessage({
                    name: "getSequenceData"
                }, function(response) {
                    console.log(response);
                    sequenceData = response.sequenceData;
                    callback();
                });
            },

            function(callback) {
                charCode = "text/plain;";
                if (sequenceData.currentCharCode !== undefined) {
                    charset += " " + sequenceData.currentCharCode;
                }
                callback();
            },

            function(callback) {
                firstFileName = sequenceData.firstUrl;
                secondFileName = sequenceData.secondUrl;
                if (firstFileName.toLowerCase().indexOf('server') !== -1) {
                    firstSource = 'Server';
                    secondSource = 'Client';
                }
                else {
                    firstSource = 'Client';
                    secondSource = 'Server';
                }
                callback();
            },

            function(callback) {
                console.log("sequenceData.firstUrl" + sequenceData.firstUrl);
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    console.log(this.response);
                    if (this.readyState == 4) {
                        firstFileContent = this.response;
                        successGetFirstFile = true;
                        callback();
                    } else {
                        callback("cantReadFile");
                    }
                };
                xhr.open('GET', sequenceData.firstUrl, true);
                //xhr.overrideMimeType(charCode);
                xhr.responseType = 'text';
                xhr.send();
            },

            function(callback) {
                console.log("sequenceData.secondUrl" + sequenceData.secondUrl);
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    console.log(this.response);
                    if (this.readyState == 4) {
                        secondFileContent = this.response;
                        successGetSecondFile = true;
                        callback();
                    } else {
                        callback("cantReadFile");
                    }
                };
                xhr.open('GET', sequenceData.secondUrl, true);
                //xhr.overrideMimeType(charCode);
                xhr.responseType = 'text';
                xhr.send();
            },

            function(callback) {
                var width = $(window).width() * 0.9;
                if (width < 1200) {
                    width = 1200;
                }
                $("#container").css("width", width);
                $("#container").css("margin", '5px auto');
                $("#htmlLeftTitle").css("width", width / 2);
                $("#htmlLeftTitleUrl").css("width", width / 2 - 10);

                var height = $(window).height() * 0.75;
                if (height < 600) {
                    height = 600;
                }

                $(document).ready(function() {
                    console.log("Documents are ready. Combine!");
                    buildSequence();
                });
            }
        ],

        function(err, results) {
            if (err) {
                console.log(err);
                var msg;
                if (err === "cantAccessToUrl") {
                    msg = chrome.i18n.getMessage("sequence_error_cantAccessToUrl");
                }
                if (err === "cantReadFile") {
                    msg = chrome.i18n.getMessage("sequence_error_cantReadFile");
                }
                if (msg) {
                    alert(msg);
                }
                throw err;
            }

            console.log('Series all done. ' + results);
            $('#preloaderContainer').hide();
            $('#htmlLeftTitle').css("visibility", "visible");
            $('#htmlRightTitle').css("visibility", "visible");
        });
};


function buildSequence() {

    var l = [];
    prepareFileContent(l, firstFileContent, firstSource);
    prepareFileContent(l, secondFileContent, secondSource);
    l.sort(function (a, b) {
        var delta = 0;
        if (a && b && a.datetime && b.datetime) {
            var now = new Date();
            var da = isValidDate(a.datetime) ? new Date(a.datetime) : now;
            var db = isValidDate(b.datetime) ? new Date(b.datetime) : now;
            delta = da - db;
        }
        return delta;
    });
    var dataContainer = $('#dataContainer');
    l.forEach(function(line) {
        console.log(line);
        var isServer = (line.source === 'Server');
        var sourceSymbol = isServer ? 'S' : '&nbsp;';
        var text = '<span class="text">' + line.text + '</span>';
        var dt =
            '<span class="datetime">' +
              //$.format.date(new Date(line.datetime), 'yyyy-MM-ddTHH:mm:ss.SSS') +
              $.format.date(new Date(line.datetime), 'HH:mm:ss.SSS') +
            '</span>';
        var line = '<span class="source">' + sourceSymbol + '</span>' + '&nbsp;' + dt + '&nbsp;' + text;
        dataContainer.append(
            '<div class="' + (isServer ? 'server' : 'client') + '">' +
              '<div class="row">' + line + '</div>' +
            '</div>'
        );
    });
}


function prepareFileContent(result, fileContent, source) {

    var splitted = fileContent.split(ROW_SEPARATOR);
    splitted.forEach(function(line) {
        var o = parseLine(line, source);
        if (o.datetime !== undefined) {
          result.push(o);
        }
    });
}


function parseLine(line, source) {

    var o = {
        source: source
    };
    var pos = line.indexOf(DATETIME_SEPARATOR);
    if (pos !== -1) {
        var dt = line.substr(1, pos - (DATETIME_SEPARATOR.length - 1));
        o.datetime = parseDateTime(dt);
        console.log(o.datetime);
        o.text = line.substr(pos + DATETIME_SEPARATOR.length);
    }
    else {
        o.text = line;
    }

    return o;
}


// source: 2020-06-19T10:46:21:770+03
// needed: 2020-06-19T10:46:21.770Z
function parseDateTime(s) {

    var pos = s.length - 3;
    var h = s.substr(pos);
    h = Number.parseInt(h);

    s = s.substr(0, pos);
    pos = s.lastIndexOf(':');
    s = s.substring(0, pos) + '.' + s.substring(pos + 1);

    s += 'Z';

    var d = Date.parse(s);
    return isValidDate(d) ? d : undefined;
}
