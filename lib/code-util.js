
var getCursorIndex = function () {
    editor = atom.workspace.getActiveTextEditor();
    text = editor.getText();

    currentPosition = editor.getCursorBufferPosition();

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
    editor = atom.workspace.getActiveTextEditor();
    text = editor.getText();

    // is cursor on method or type/variable name?
    var currentSegmentStart;
    var currentSegmentEnd;

    for (var currentSegmentStart = index; currentSegmentStart >= 0; currentSegmentStart--) {
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

var getFullClassName = function (index) {
    text = editor.getText();

    segment = getCurrentSegment(index)
    type = segment["type"]
    str = segment["str"]

    if (type == OTHER)
        return null;
    else if (type == TYPE) {
        lines = text.split('\n');
        var simpleTypeName = str;
        // find package name
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import')) {
                var fullPackage = fullPackageName(lines[i], simpleTypeName)
                if (fullPackage != null)
                    return fullPackage;
            }
        }
    }

    return null;
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
    segment = getCurrentSegment(index)

    if (segment["str"].length == 0)
        return null;

    editor = atom.workspace.getActiveTextEditor();
    text = editor.getText();

    // go to declaration

    var regex = new RegExp("[A-Z][a-zA-Z]* " + segment["str"]);
    var declarationPos = text.regexLastIndexOf(regex, index);
    if (declarationPos == -1)
        return null;

    var fullClassName = getFullClassName(declarationPos);

    return fullClassName;
}

var getFullClassNameForFunction = function (index) {
    editor = atom.workspace.getActiveTextEditor();
    text = editor.getText();

    segment = getCurrentSegment(index);
    type = segment["type"];
    str = segment["str"];

    if (type != 0)
        return null;

    if (text.charAt(segment["start"] - 1) != ".")
        return null;

    return getFullClassNameForVariable(segment["start"] - 2);
}

var fullPackageName = function (importLine, typeName) {
    // only return if it matches typeName
    var packageStart = importLine.indexOf(' ');
    var p = importLine.substr(packageStart);
    var comps = p.split('.');
    if (comps[comps.length - 1] !== typeName + ";")
        return null;
    else
        return p.substr(0, p.length - 1);
}

var sendRequest = function (exemplatorPluginView, request, page = 0) {
    console.log("hi 1")
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "http://localhost:4567/search");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");


    var dict = {}

    if (request.package != null)
        dict["package"] = packageName;
    if (request.class != null)
        dict["class"] = className;
    if (request.method != null)
        dict["method"] = methodName;
    if (request.token != null)
        dict["token"] = plainStr;
    dict["page"] = page;

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