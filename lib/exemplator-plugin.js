'use babel';

import ExemplatorPluginView from './exemplator-plugin-view';
import {CompositeDisposable} from 'atom';

const FUNCTION = 0;
const TYPE = 1;
const OTHER = 2;

var getCursorIndex = function () {
    var editor = atom.workspace.getActiveTextEditor();
    var text = editor.getText();

    var currentPosition = editor.getCursorBufferPosition();

    var row = 0;
    var col = 0;
    var index;
    // translate row and column into an index for text
    for (index = 0; index < text.length; index++) {
        if (row == currentPosition.row && col == currentPosition.column)
            break;

        if (text.charAt(index) == '\n') {
            row++;
            col = 0;
        } else {
            col++;
        }
    }

    return index;
}

var getCurrentSegment = function (index) {
    var editor = atom.workspace.getActiveTextEditor();
    var text = editor.getText();

    // is cursor on method or type/variable name?
    var currentSegmentStart;
    var currentSegmentEnd;

    for (var currentSegmentStart = Math.max(0, index - 1); currentSegmentStart >= 0; currentSegmentStart--) {
        var c = text.charAt(currentSegmentStart);

        if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z')) {
            currentSegmentStart++;
            break;
        }
    }

    var type;

    for (var currentSegmentEnd = index; currentSegmentEnd < text.length; currentSegmentEnd++) {
        var c = text.charAt(currentSegmentEnd);

        if (c == '(') {
            type = FUNCTION;
            currentSegmentEnd--;
            break;
        } else if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z')) {
            currentSegmentEnd--;
            break;
        }
    }

    if (type != FUNCTION) {
        // type declaration if capitalized
        if (text.charAt(currentSegmentStart) >= 'A' && text.charAt(currentSegmentStart) <= 'Z')
            type = TYPE;
        else
            type = OTHER;
    }

    return {
        "type": type,
        "str": text.substr(currentSegmentStart, (currentSegmentEnd - currentSegmentStart) + 1),
        "start": currentSegmentStart,
        "end": currentSegmentEnd
    };
}

var getPackage = function (index) {
    var editor = atom.workspace.getActiveTextEditor();
    var text = editor.getText();

    var segment = getCurrentSegment(index)
    var type = segment["type"]
    var str = segment["str"]

    if (type == OTHER)
        return null;
    else if (type == TYPE) {
        lines = text.split('\n');
        var simpleTypeName = str;
        // find package name
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import')) {
                var packageName = getPackageName(lines[i], simpleTypeName)
                if (packageName != null)
                    return {"package": packageName, "name": simpleTypeName};
            }
        }
    }

    return {"name": str};
}

String.prototype.regexIndexOf = function (regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

String.prototype.regexLastIndexOf = function (regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if (typeof (startpos) == "undefined") {
        startpos = this.length;
    } else if (startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = this.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while ((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
}

var getFullClassNameForVariable = function (index) {
    var segment = getCurrentSegment(index)

    if (segment["str"].length == 0)
        return null;

    var editor = atom.workspace.getActiveTextEditor();
    var text = editor.getText();

    // go to declaration

    var regex = new RegExp("[A-Z][a-zA-Z]* " + segment["str"]);
    var declarationPos = text.regexLastIndexOf(regex, index);
    if (declarationPos == -1)
        return null;

    var fullClassName = getPackage(declarationPos);

    return fullClassName;
}

var getFullClassNameForFunction = function (index) {
    var editor = atom.workspace.getActiveTextEditor();
    var text = editor.getText();

    var segment = getCurrentSegment(index);
    var type = segment["type"];
    var str = segment["str"];

    if (type != FUNCTION)
        return null;

    if (text.charAt(segment["start"] - 1) != ".")
        return null;

    return getFullClassNameForVariable(segment["start"] - 2);
}

var getPackageName = function (importLine, typeName) {
    // only return if it matches typeName
    var packageStart = importLine.indexOf(' ');
    var p = importLine.substr(packageStart);
    var comps = p.split('.');
    var packageWithClass = comps[comps.length - 1];
    packageWithClass = packageWithClass.substr(0, packageWithClass.length - 1)
    if (packageWithClass !== typeName)
        return null;
    else {
        var packageWithClass = p.substr(0, p.length - 1);
        return packageWithClass.replace("." + typeName, "")
    }
}

var sendRequest = function (exemplatorPluginView, request, page = 0) {
    console.log("hi 1")
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "http://localhost:4567/search");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");


    var dict = {}

    if (request.class != null && request.class.package != null)
        dict["package"] = request.class.package;
    if (request.class != null && request.class.name != null)
        dict["class"] = request.class.name;
    if (request.method != null)
        dict["method"] = request.method;
    if (request.token != null)
        dict["token"] = request.token;
    dict["page"] = page;

    console.log("Dict to be sent: ");
    console.log(dict);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                handleResponse(exemplatorPluginView, xmlhttp.responseText);
            }
            else if (xmlhttp.status == 400) {
                console.log("Error 400 returned from server");
            }
            else {
                console.log("Error returned from serve");
            }
        }
    };

    xmlhttp.send(JSON.stringify(dict));
}

var handleResponse = function (exemplatorPluginView, responseText) {
    var response = JSON.parse(responseText);
    console.log("Response from server: ");
    console.log(response);

    var responseArray = response.occurrences;
    console.log(responseArray)

    var data = {
        examples: []
    }

    responseArray.forEach(item => {
        item.selections.forEach(selection => {
            if (selection.start.line != -1) {
                var element = {
                    user: 'bill',
                    score: item.userUrl,
                    userurl: item.userUrl,
                    rawUrl: item.rawUrl,
                    code: item.code,
                    selection: selection
                }
                data.examples.push(element)
            }
        })
    })

    exemplatorPluginView.setData(data);
}

export default {

    exemplatorPluginView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.exemplatorPluginView = new ExemplatorPluginView(state.exemplatorPluginViewState);
        this.modalPanel = atom.workspace.addRightPanel({
            item: this.exemplatorPluginView.getElement(),
            visible: true
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'Exemplator:toggle': () => this.toggle()
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'Exemplator:showExamples': () => this.showExamples()
        }));
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.exemplatorPluginView.destroy();
    },

    serialize() {
        return {
            exemplatorPluginViewState: this.exemplatorPluginView.serialize()
        };
    },

    toggle() {
        console.log('ExemplatorPlugin was toggled!');
        return (
            this.modalPanel.isVisible() ?
                this.modalPanel.hide() :
                this.modalPanel.show()
        );
    },

    showExamples() {
        editor = atom.workspace.getActiveTextEditor();

        var request = {

        };
        // text selected? then search for plain string
        if (editor.getSelectedText().length > 0) {
            var plainStr = editor.getSelectedText();
            console.log("Found plain str: " + plainStr);
            request.token = plainStr;
        } else {
            var index = getCursorIndex();
            // function?
            var classNameForFunction = getFullClassNameForFunction(index);
            if (classNameForFunction != null) {
                var functionName = getCurrentSegment(index)["str"];
                console.log("found " + classNameForFunction + "." + functionName);
                request.class = classNameForFunction;
                request.method = functionName;
            } else {
                var classNameForVariable = getFullClassNameForVariable(index);
                if (classNameForVariable != null) {
                    console.log("found " + classNameForVariable);
                    request.class = classNameForVariable;
                } else {
                    // type?
                    var classNameForType = getPackage(index);
                    if (classNameForType != null) {
                        console.log("found " + classNameForType);
                        request.class = classNameForType;
                    } else {
                        console.log("Nothing found");
                    }
                }
            }
        }

        console.log(request)
        //this.exemplatorPluginView.setData();
        sendRequest(this.exemplatorPluginView, request);
    }
};
