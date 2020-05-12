//  json2.js
//  2017-06-12
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(
//                         +a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]
//                      ));
//                  }
//                  return value;
//              }
//          });

//          myData = JSON.parse(
//              "[\"Date(09/09/2001)\"]",
//              function (key, value) {
//                  var d;
//                  if (
//                      typeof value === "string"
//                      && value.slice(0, 5) === "Date("
//                      && value.slice(-1) === ")"
//                  ) {
//                      d = new Date(value.slice(5, -1));
//                      if (d) {
//                          return d;
//                      }
//                  }
//                  return value;
//              }
//          );

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return (n < 10)
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? (
                    this.getUTCFullYear()
                    + "-"
                    + f(this.getUTCMonth() + 1)
                    + "-"
                    + f(this.getUTCDate())
                    + "T"
                    + f(this.getUTCHours())
                    + ":"
                    + f(this.getUTCMinutes())
                    + ":"
                    + f(this.getUTCSeconds())
                    + "Z"
                )
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (
            value
            && typeof value === "object"
            && typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return (isFinite(value))
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? (
                            "[\n"
                            + gap
                            + partial.join(",\n" + gap)
                            + "\n"
                            + mind
                            + "]"
                        )
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" && (
                typeof replacer !== "object"
                || typeof replacer.length !== "number"
            )) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u"
                        + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());



/**
 * setTimeout
 * Version 1.0
 * A setTimeout function implementation for InDesign ExtendScript like known from a Browser's Javascript.
 * Uses InDesign's idleTask stuff.
 * Timeout milliseconds are not accurate, but it allows to call a heavy load script,
 * split it up into small junks for InDesign is not blocked too long and has time to breath.
 *
 * The script MUST run in its dedicated target engine:
 * #target "InDesign"
 * #targetengine "myOwnEngineName"
 *
 * DISCLAIMER:
 * No warranty - use as is or modify but retain the originator's coordinates:
 * CopyRight Andreas Imhof, www.aiedv.ch, ai@aiedv.ch
 */
//
var setTimeout_Task_curfile = new File($.fileName),
setTimeout_Task_curfullname = decodeURI(setTimeout_Task_curfile.name),
                // setTimeout_Taskname must be a UNIQUE name, so we take it from the current running script!! 
                // May be set to any String like
                // setTimeout_Taskname = 'myOwnTask';
setTimeout_Taskname = setTimeout_Task_curfullname.lastIndexOf(".") > 0 ? (setTimeout_Task_curfullname.substr(0,setTimeout_Task_curfullname.lastIndexOf("."))) : setTimeout_Task_curfullname,

setTimeout_Tasks = {},  // all defined tasks prepared to run
/**
 * setTimeout_hasIdleTask
 * Utility function
 * @param {Number} the timeout task id
 * @return {Boolean} true if a given timeout id also has his attached idleTask
 */
setTimeout_hasIdleTask = function(id) {
  var has = false, i;
  for (i = 0; i < app.idleTasks.length; i++) {
    //alert("id: " + id + " tid: " + app.idleTasks[i].label);
    if (app.idleTasks[i].isValid && (app.idleTasks[i].id === id)) {
      has = true;
      break;
    }
  }
  return has;
},
/**
 * setTimeoutList
 * Utility function
 * @return {String} a list of all currently active setTimeout_Tasks
 */
setTimeoutList = function() {
  var list = "", cb,
    k;
  for (k in setTimeout_Tasks) {
    if (list !== "") list += ",";
    cb = setTimeout_Tasks[k]["cb"].toString();
    cb = cb.replace(/\s/g,"");
    list += setTimeout_Tasks[k]["taskid"] + ":" + cb;
  }
  return list;
},
/**
 * idleTasksList
 * Utility function
 * @return {String} a list of all currently active idleTasks
 */
idleTasksList = function() {
  var list = "",
    k;
  for (k = 0; k < app.idleTasks.length; k++) {
    if (list !== "") list += ",";
    list += app.idleTasks[k].id + ":" + setTimeout_hasIdleTask(app.idleTasks[k].id) + ":" + app.idleTasks[k].label;
  }
  return list;
},
/**
 * setTimeoutInit
 * Init/clean the timeout system
 */
setTimeoutInit = function() {
  var it;
  // remove all (erroneous) idleTasks
  //alert("set idleTasks: " + app.idleTasks.length);
  //NA: logmess("setTimeoutInit set idleTasks: " + app.idleTasks.length + "\n");
  for (it = 0; it < app.idleTasks.length; it++) {
    if (app.idleTasks[it].label == setTimeout_Taskname) {
      //alert("removing idleTask id " + app.idleTasks[it].id + " label: " + app.idleTasks[it].label);
      clearTimeout(app.idleTasks[it].id);
    }
  }
  setTimeout_Tasks = {};
},
/**
 * Tasks Handler
 * Check if a task can be called now
 * @param {Number} taskid
 * @return {Boolean} always false
 */
setTimeoutHandler = function(taskid) {
  var now_Ticks = new Date().getTime(),
    cb, cb_retval = undefined;

  try {
    //alert("taskid: " + taskid + "\nnumcalls: " + setTimeout_Tasks[taskid]["numcalls"]);
    // we look for well timed call only!!!  CS6 calls at start AND after the timeout
    if (setTimeout_Tasks[taskid]["end_ticks"] > now_Ticks) {    // we have not reached timeout
      //NA: logmess("setTimeoutHandler id " +  taskid + " too early by ms: " + (setTimeout_Tasks[taskid]["end_ticks"] - now_Ticks) + "\n");
      //alert("setTimeoutHandler id " +  taskid + " too early by ms: " + (setTimeout_Tasks[taskid]["end_ticks"] - now_Ticks));
      setTimeout_Tasks[taskid]["numcalls"] += 1;
      return false; // wait for next call
    }
  }
  catch(ex) {
    alert("Exception (1) in function 'setTimeoutHandler()', taskid " + taskid + ":\n" + ex);
  }

  try {
    cb = setTimeout_Tasks[taskid]["cb"];    // store the callback
    clearTimeout(taskid);   // remove the timeout
  }
  catch(ex) {
    alert("Exception (2) in function 'setTimeoutHandler()', taskid " + taskid + ":\n" + ex);
  }

  try {
    //NA: logmess("setTimeoutHandler call " +  cb + "\n");
    cb_retval = cb();   // call the cb
    //if (cb_retval) alert("cb_retval:\n" + cb_retval);
  } catch(ex) {
    alert("Exception in function '" + cb() + ":\n" + ex);
  }

  return false;
},
/**
 * setTimeout
 * Set a function to called after the given timeout
 * @param {function} callback the function to call
 * @param {Number} timeout in ms
 * @return {Boolean} null on error, otherwise the id (can be used with clearTimeout
 */
setTimeout = function(callback,timeout) {
  try {
    var idle_Task,
      now_Ticks = new Date().getTime();
    idle_Task = app.idleTasks.add({sleep:timeout});
    idle_Task.label = setTimeout_Taskname;
    setTimeout_Tasks[idle_Task.id] = {
      "label": setTimeout_Taskname,
      "start_ticks": now_Ticks,
      "sleep": timeout,
      "end_ticks": now_Ticks + timeout,
      "cb": callback,
      "taskid": idle_Task.id,
      "numcalls": 0
      };
    setTimeout_Tasks[idle_Task.id].handler = function(ev){setTimeoutHandler(setTimeout_Tasks[idle_Task.id]["taskid"]);};
    idle_Task.addEventListener(IdleEvent.ON_IDLE, setTimeout_Tasks[idle_Task.id].handler,false);
    //NA: logmess("setTimeout idle_Task.id: " + idle_Task.id + ", timeout: " + timeout + "\ncallback: " + callback + "\n");
    return idle_Task.id;
  }
  catch(ex) {
    alert("Exception in function 'setTimeout()':\n" + ex);
  }
  return null;
},
/**
 * clearTimeout
 * Clear the timeout given by the setTimeout return value
 * @param {Number} id the timeout id to clear
 */
clearTimeout = function (id){
  var i, task = null;
  for (i = 0; i < app.idleTasks.length; i++) {
    //alert("id: " + id + " tid: " + app.idleTasks[i].label);
    if ((app.idleTasks[i].id == id) && app.idleTasks[i].isValid) {
      task = app.idleTasks[i];
      break;
    }
  }

  if (task !== null) {
    try {
      if (setTimeout_Tasks[id] && setTimeout_Tasks[id].handler) {
        // this kills any!!!    app.idleTasks.itemByID(id).removeEventListener(IdleEvent.ON_IDLE, setTimeout_Tasks[id].handler,false);
        task.removeEventListener(IdleEvent.ON_IDLE, setTimeout_Tasks[id].handler,false);
      }
      // this kills any!!!    app.idleTasks.itemByID(id).remove();
      //task.remove();
      task.sleep = 0;
    }
    catch(ex) {
      alert("Exception in function 'clearTimeout() idleTasks':\n" + ex);
    }
    try {
      delete setTimeout_Tasks[id];
    }
    catch(ex) {
      alert("Exception in function 'clearTimeout() delete setTimeout_Tasks':\n" + ex);
    }
  }
};
/**
 * Init/clean the timeout system
 */
setTimeoutInit();
// alert(setTimeout_Taskname);  // Just to check if the 'setTimeout_Taskname' was set correctly

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}




var plugplugLibrary = new ExternalObject("lib:\PlugPlugExternalObject");



//The locale-independent name (aka "key string") for the
//Layout context menu is "$ID/RtMouseLayout".
var myLayoutContextMenu = app.menus.item("$ID/RtMouseLayout");
//Create the event handler for the "beforeDisplay"
//event of the Layout context menu.
var myBeforeDisplayListener = myLayoutContextMenu.addEventListener("beforeDisplay", myBeforeDisplayHandler);

var mySelectionChangedListener = app.activeDocument.addEventListener("afterSelectionChanged", handlePeblExtensionClick);

var myBeforeExportListener = app.addEventListener("beforeExport", handleBeforeExport);
var myAfterExportListener = app.addEventListener("afterExport", handleAfterExport);

var myAfterPlaceListener = app.activeDocument.addEventListener("afterPlace", handleAfterPlace);
//This event handler checks the type of the selection.
//If a graphic is selected, the event handler adds the script menu
//action to the menu.
function myBeforeDisplayHandler(myEvent){
    if(app.documents.length != 0){
        if(app.selection.length > 0){
            var myObjectList = new Array;
            //Does the selection contain any graphics?
            for(var myCounter = 0; myCounter < app.selection.length;
                myCounter ++){
                switch(app.selection[myCounter].constructor.name){
                case "PDF":
                case "EPS":
                case "Image":
                    // myObjectList.push(app.selection[myCounter]);
                    // break;
                case "Rectangle":
                    if (app.selection[myCounter].name == "PeBL Extension") {
                        myObjectList.push(app.selection[myCounter]);
                        break;
                    }
                case "Oval":
                case "Polygon":
                    // if(app.selection[myCounter].graphics.length != 0){
                    //     myObjectList.push(app.selection[myCounter].graphics.item(0));
                    // }
                    // break;
                default:
                }
            }
            if(myObjectList.length > 0) {
                //myLayoutContextMenu.menuItems.item("Create Graphic Label").remove();
                myMakeLabelGraphicMenuItem();
                //Add the menu item if it does not already exist.
                // if(myCheckForMenuItem(myLayoutContextMenu, "Create Graphic Label") == false){
                //     myMakeLabelGraphicMenuItem();
                // }
            }
            else{
                //Remove the menu item, if it exists.
                // if(myCheckForMenuItem(myLayoutContextMenu, "Create Graphic Label") == true){
                //     myLayoutContextMenu.menuItems.item("Create Graphic Label").remove();
                // }
            }
        }
    }
    function myMakeLabelGraphicMenuItem(){
        // try {
        //     var test = app.scriptMenuActions.item("Preview PeBL Extension").name;
        // } catch (e) {
        //     var previewMenuAction = app.scriptMenuActions.add("Preview PeBL Extension");

        //     var previewEventListener = previewMenuAction.eventListeners.add("onInvoke",
        //                                                                                   previewEventHandler,
        //                                                                                   false);
        //     var previewMenuItem = app.menus.item("$ID/RtMouseLayout").menuItems.add(app.scriptMenuActions.item("Preview PeBL Extension"));
        // }

        try {
            var test = app.scriptMenuActions.item("Edit PeBL Extension").name;
        } catch (e) {
            var editMenuAction = app.scriptMenuActions.add("Edit PeBL Extension");
            var editEventListener = editMenuAction.eventListeners.add("onInvoke", editEventHandler, false);
            var editMenuItem = app.menus.item("$ID/RtMouseLayout").menuItems.add(app.scriptMenuActions.item("Edit PeBL Extension"));
        }
        
        function previewEventHandler(myEvent){
            try {
                var extensionProperties;
                var html;
                if (app.documents.length != 0){
                    if (app.selection.length > 0){
                        for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                            if (app.selection[myCounter].constructor.name === "Rectangle" && app.selection[myCounter].name == "PeBL Extension") {
                                extensionProperties = app.selection[myCounter].label;
                                html = app.selection[myCounter].htmlItems.item(0).htmlContent;
                            }
                        }
                    }
                }

                if (extensionProperties && html) {
                    extensionProperties = JSON.parse(extensionProperties);
                    var csxsEvent = new CSXSEvent();
                    csxsEvent.type = "openPreviewPeblWindow";
                    csxsEvent.data = JSON.stringify({html: html, slug: extensionProperties.dataProperties.type, imageMap:extensionProperties.imageMap});
                    csxsEvent.dispatch();
                }
            } catch (e) {
                logToFile('PeBL Error: 29 - ' + e.toString());
                alert('PeBL Error: 29 - ' + e.toString());
            }
        }

        function editEventHandler(myEvent) {
            try {
                var extensionProperties;
                if (app.documents.length != 0){
                    if (app.selection.length > 0){
                        for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                            if (app.selection[myCounter].constructor.name === "Rectangle" && app.selection[myCounter].name == "PeBL Extension") {
                                extensionProperties = app.selection[myCounter].label;
                            }
                        }
                    }
                }

                if (extensionProperties) {
                    app.panels.itemByName("PeBL Content").visible = true;
                    
                    var csxsEvent = new CSXSEvent();
                    csxsEvent.type = "editExtension";
                    csxsEvent.data = extensionProperties;
                    csxsEvent.dispatch();
                }
            } catch (e) {
                logToFile('PeBL Error: 28 - ' + e.toString());
                alert('PeBL Error: 28 - ' + e.toString());
            }
        }
    }
}

function addTheme(name, pathToCss) {
    try {
        var name = unescape(name);
        var pathToCss = unescape(pathToCss);

        var cssFile = File(pathToCss);
        cssFile.open('r', undefined, undefined);

        var tempCssFile = cssFile.read();

        cssFile.close();


        var path = Folder.temp.fullName + '/pebl-theme-' + name + '.css';
        var file = File(path);

        if (!file.exists) {
            file = new File(path);
        }

        var output = file.open('w', undefined, undefined);
        file.encoding = "UTF-8";
        file.lineFeed = "Unix";

        file.write(tempCssFile);
        file.close();

        var peblSettings = getPeblSettings();
        if (peblSettings.length > 0) {
            try {
                peblSettings = JSON.parse(peblSettings);
            } catch (e) {
                logToFile('PeBL Error: parseSettings addTheme - ' + e.toString());
                alert('PeBL Error: parseSettings addTheme - ' + e.toString());
                return;
            }
        } else {
            peblSettings = {
                "customThemes": {}
            };
        }

        if (!peblSettings.customThemes)
            peblSettings.customThemes = {};

        peblSettings.customThemes[name] = path;

        savePeblSettings(JSON.stringify(peblSettings));

        var csxsEvent = new CSXSEvent();
        csxsEvent.type = "addedPeblTheme";
        csxsEvent.data = name;
        csxsEvent.dispatch();
    } catch (e) {
        logToFile('PeBL Error: addTheme - ' + e.toString());
        alert('PeBL Error: addTheme - ' + e.toString());
    }
}

function createConfigFile() {
    var path = Folder.temp.fullName + '/pebl-config-widget.js';
    var file = File(path);

    if (!file.exists) {
        file = new File(path);
    }

    var output = file.open('w', undefined, undefined);
    file.encoding = "UTF-8";
    file.lineFeed = "Unix";
    file.writeln('try {var globalPebl = (window.parent && window.parent.PeBL) ? window.parent.PeBL : (window.PeBL ? window.PeBL : null);}catch(e) {var globalPebl = window.PeBL ? window.PeBL : null}');
    file.writeln('var config = {};globalPebl.extension.config = config;');
    file.writeln('if (!window.Configuration)');
    file.writeln('    window.Configuration = {};');
    file.writeln('window.Configuration.useLinkedIn = false;');

    var peblSettings = getPeblSettings();
    var startNotifications;
    if (peblSettings.length > 0) {
        try {
            peblSettings = JSON.parse(peblSettings);

            if (peblSettings.lrsUrl && peblSettings.lrsUrl.length > 0) {
                file.writeln('window.Configuration.lrsUrl = "' + peblSettings.lrsUrl + '";');
            }

            if (peblSettings.lrsCredential && peblSettings.lrsCredential.length > 0) {
                file.writeln('window.Configuration.lrsCredential = "' + peblSettings.lrsCredential + '";');
            }

            if (peblSettings.menuBarEnabled === true) {
                file.writeln("config.menuBar = {enabled: true, notesThread: '" + peblSettings.menuBarNotesThread + "', forumThread: '" + peblSettings.menuBarForumThread +"'}");
                if (peblSettings.menuBarContentMorphingGroup && peblSettings.menuBarContentMorphingGroup.length > 0) {
                    file.writeln("config.contentMorphing = {contentMorphingGroup: '" + peblSettings.menuBarContentMorphingGroup + "', contentMorphingLevels: " + JSON.stringify(peblSettings.contentMorphingLevels) + "}");
                }
                var guidedTour = [
                    {
                        message: "View resources related to this ebook – and add your own.",
                        targetElement: "#menuBarExternalResourcesButton",
                        position: "bottom-left"
                    },
                    {
                        message: "Take private notes on this ebook.",
                        targetElement: "#menuBarNotesButton",
                        position: "bottom-left"
                    },
                    {
                        message: "Discuss this ebook with your fellow Marines.",
                        targetElement: "#menuBarForumButton",
                        position: "bottom-right"
                    },
                    {
                        message: "Switch between the self-study and the group versions of this ebook.",
                        targetElement: "#menuBarContentMorphButton",
                        position: "bottom-right"
                    },
                    {
                        message: "Send an email with your feedback.",
                        targetElement: "#menuBarFeedbackButton",
                        position: "bottom-right"
                    },
                    {
                        message: "Get more help with the interactive features of the ebook.",
                        targetElement: "#menuBarHelpButton",
                        position: "bottom-right"
                    },
                    {
                        message: "See your notifications from this ebook.",
                        targetElement: "#menuBarNotificationButton",
                        position: "bottom-right",
                        end: true
                    }
                ]
                file.writeln("config.guidedTour = " + JSON.stringify(guidedTour) + ";");
            }

            if (peblSettings.externalResources && peblSettings.externalResources.length > 0) {
                file.writeln("config.externalResources = {resources: " + JSON.stringify(peblSettings.externalResources) + "}");
            }

            if (peblSettings.feedbackEmail && peblSettings.feedbackEmail.length > 0) {
                file.writeln("config.feedbackEmail = '" + peblSettings.feedbackEmail + "';");
            }

            if (peblSettings.helpUrl && peblSettings.helpUrl.length > 0) {
                file.writeln("config.helpUrl = '" + peblSettings.helpUrl + "';");
            }
        } catch (e) {
            logToFile('PeBL Error: Create Config - ' + e.toString());
            alert('PeBL Error: Create Config - ' + e.toString());
        }
    }

    var dummyTOC = {
        "Section1": {
            "Section": {
                "location": '',
                'title': '',
                'prefix': '1'
            },
            "DynamicContent": {
                "documents": {

                }
            }
        }
    }

    file.writeln('var dummyTOC = ' + JSON.stringify(dummyTOC));

    file.writeln('config.onLoadFunctions = {}');

    file.writeln('config.onLoadFunctions.initializeToc = function () {\
                    globalPebl.utils.initializeToc(dummyTOC);\
                }');

    if (peblSettings.menuBarEnabled) {
        file.writeln('config.onLoadFunctions.startTour = function() {\
                        setTimeout(function() {\
                            var skipTour = window.localStorage.getItem("guidedTourFinished");\
                            if (!skipTour)\
                                globalPebl.extension.guidedTour.startTour(document.getElementById("pebl__main-menu"));\
                        }, 1000)\
                    }');
    }

    file.writeln('$(document).ready(function() {\
                    if (config.onLoadFunctions) {\
                        Object.values(config.onLoadFunctions).forEach(function(value) {\
                            if (typeof value === "function") {\
                                value();\
                            }\
                        });\
                    }\
                });');

    file.close();
}

function createDynamicTocFile() {
    var path = Folder.temp.fullName + '/pebl-initialize-toc-widget.js';
    var file = File(path);

    if (!file.exists) {
        file = new File(path);
    }

    var output = file.open('w', undefined, undefined);
    file.encoding = "UTF-8";
    file.lineFeed = "Unix";

    file.close();
}

function insertPlaceholderImages(imageMap) {
    try {
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.pixels;
        var imagesToInsert = Object.keys(imageMap.localToEbookPaths);
        var pageWidth = (app.activeWindow.activePage.bounds[3] - app.activeWindow.activePage.bounds[1]);
        var pageHeight = (app.activeWindow.activePage.bounds[2] - app.activeWindow.activePage.bounds[0]);
        for (var i = 0; i < imagesToInsert.length; i++) {
            var existingImage = app.activeDocument.pageItems.itemByName(imagesToInsert[i]);
            if (existingImage == null) {
                var image = app.activeWindow.activePage.place(new File(imagesToInsert[i]));
                var imageFrame = image[0].parent;
                imageFrame.objectExportOptions.preserveAppearanceFromLayout = PreserveAppearanceFromLayoutEnum.PRESERVE_APPEARANCE_USE_EXISTING_IMAGE;
                imageFrame.geometricBounds = [0,0,1,1];
                imageFrame.name = imagesToInsert[i];
                imageFrame.appliedObjectStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-placeholderImage');
                imageFrame.move([pageWidth - 1, pageHeight - 1]);
                image[0].itemLink.unlink();
            }
        }
    } catch (e) {
        logToFile('PeBL Error: 27 - ' + e.toString());
        alert('PeBL Error: 27 - ' + e.toString());
    }
}

function getNumberOfDocuments() {
    return app.documents.length.toString();
}

function emitSetEpubExportOptions() {
    try {
        var peblTheme = getPeblTheme();
        var data = {};

        var csxsEvent = new CSXSEvent();
        csxsEvent.type = "setEpubExportOptions";

        if (peblTheme) {
            if (peblTheme[0] === true)
                data.theme = peblTheme[1];
            else
                data.customTheme = peblTheme[1];
        }

        csxsEvent.data = JSON.stringify(data);

        csxsEvent.dispatch();
    } catch (e) {
        logToFile('PeBL Error: 26 - ' + e.toString());
        alert('PeBL Error: 26 - ' + e.toString());
    }
}

function setEpubExportOptions(optionsString) {
    try {
        var options = JSON.parse(unescape(optionsString));

        var stylesheets = [];
        for (var i = 0; i < options.externalStyleSheets.length; i++) {
            stylesheets.push(unescape(options.externalStyleSheets[i]));
        }

        app.activeDocument.epubExportPreferences.externalStyleSheets = stylesheets;

        var javascripts = [];
        for (var i = 0; i < options.javascripts.length; i++) {
           javascripts.push(unescape(options.javascripts[i]));
        }

        //Add config file from temp
        javascripts.splice(2, 0, Folder.temp.fsName + '/pebl-config-widget.js');

        app.activeDocument.epubExportPreferences.javascripts = javascripts;

        app.activeDocument.epubExportPreferences.includeClassesInHTML = true;
        app.activeDocument.epubExportPreferences.generateCascadeStyleSheet = true;
        app.activeDocument.epubExportPreferences.preserveLocalOverride = true;
        app.activeDocument.epubExportPreferences.embedFont = true;
        app.activeDocument.epubExportPreferences.version = EpubVersion.EPUB3;
        app.activeDocument.epubExportPreferences.customImageSizeOption = ImageSizeOption.SIZE_RELATIVE_TO_TEXT_FLOW;
        app.activeDocument.epubExportPreferences.imageAlignment = ImageAlignmentType.ALIGN_LEFT;
        app.activeDocument.epubExportPreferences.ignoreObjectConversionSettings = false;
    } catch (e) {
        logToFile('PeBL Error: 25 - ' + e.toString());
        alert('PeBL Error: 25 - ' + e.toString());
    }
}

// TODO: less hardcoded...
function getPeblTheme() {
    try {
        var peblSettings = getPeblSettings();
        if (peblSettings.length > 0) {
            try {
                peblSettings = JSON.parse(peblSettings);
                if (peblSettings.theme) {
                    if (peblSettings.theme === 'Default') {
                        return [true, 'pebl-theme-default.css'];
                    } else if (peblSettings.theme === 'Gunmetal') {
                        return [true, 'pebl-theme-gunmetal.css'];
                    } else if (peblSettings.theme === 'Rounded Blue') {
                        return [true, 'pebl-theme-roundedBlue.css'];
                    } else {
                        return [false, peblSettings.customThemes[peblSettings.theme]];
                    }
                }
            } catch (e) {
                logToFile('PeBL Error: 1 - ' + e.toString());
                alert('PeBL Error: 1 - ' + e.toString());
                return null;
            }
        }
        return null;
    } catch (e) {
        logToFile('PeBL Error: 24 - ' + e.toString());
        alert('PeBL Error: 24 - ' + e.toString());
    }
}

function getGlobalPeblThemeName() {
    try {
        var peblSettings = getPeblSettings();
        if (peblSettings.length > 0) {
            try {
                peblSettings = JSON.parse(peblSettings);
                if (peblSettings.theme) {
                    return peblSettings.theme;
                } else {
                    return null;
                }
            } catch (e) {
                logToFile('PeBL Error: 2 - ' + e.toString());
                alert('PeBL Error: 2 - ' + e.toString());
                return null;
            }
        }
        return null;
    } catch (e) {
        logToFile('PeBL Error: 23 - ' + e.toString());
        alert('PeBL Error: 23 - ' + e.toString());
    }
}

var preExportExtensionHtml = {};

function handleBeforeExport(evt) {
    createPeblObjectStyles();
    createConfigFile();
    // if (app.documents.length != 0) {
    //     var doc = app.activeDocument;
    //     for (var i = 0; i < doc.allPageItems.length; i++) {
    //         if (doc.allPageItems[i].constructor.name === "Rectangle" && doc.allPageItems[i].name == "PeBL Extension") {
    //             var htmlItem = doc.allPageItems[i].htmlItems.item(0);
    //             var html = htmlItem.htmlContent;
    //             preExportExtensionHtml[doc.allPageItems[i].id] = JSON.parse(JSON.stringify({html: html}));

    //             doc.allPageItems[i].htmlItems.item(0).htmlContent = '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous" />' + doc.allPageItems[i].htmlItems.item(0).htmlContent;
    //         }
    //     }
    // }
}

function handleAfterExport(evt) {
    // if (app.documents.length != 0) {
    //     var doc = app.activeDocument;
    //     for (var i = 0; i < doc.allPageItems.length; i++) {
    //         if (doc.allPageItems[i].constructor.name === "Rectangle" && doc.allPageItems[i].name == "PeBL Extension") {
    //             doc.allPageItems[i].htmlItems.item(0).htmlContent = preExportExtensionHtml[doc.allPageItems[i].id].html;
    //         }
    //     }
    // }
    // preExportExtensionHtml = {};

    // Remove unused object styles
    cleanPeblObjectStyles();
}

function handleAfterPlace(evt) {

}

function handlePeblExtensionClick(evt) {
    if (app.documents.length != 0) {
        if (app.activeDocument.selection.length != 0) {
            if (app.selection.length > 0){
                for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                    if (app.selection[myCounter].constructor.name === "Rectangle" && app.selection[myCounter].name == "PeBL Extension") {
                        emitPeblExtensionSelected(app.selection[myCounter].id);
                        break;
                    }
                }
            }
        }
    }
}

function emitPeblExtensionSelected(id) {

    var csxsEvent = new CSXSEvent();
    csxsEvent.type = "peblExtensionSelected";

    csxsEvent.data = id;

    csxsEvent.dispatch();
}

function isText(constructorName) {
    try {
        if (constructorName === 'Character' || constructorName === 'Word' || constructorName === 'Line' ||
            constructorName === 'TextColumn' || constructorName === 'Paragraph' || constructorName === 'TextStyleRange' || constructorName === 'Text') {
                return true;
        } else {
            return false;
        }
    } catch (e) {
        logToFile('PeBL Error: 22 - ' + e.toString());
        alert('PeBL Error: 22 - ' + e.toString());
    }
}

function checkSelectedContent() {
    try {
        if (app.selection && app.selection.length > 0){
            for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                if (isText(app.selection[myCounter].constructor.name)) 
                    return app.selection[myCounter].contents;
            }
        }
        return null;
    } catch (e) {
        logToFile('PeBL Error: 21 - ' + e.toString());
        alert('PeBL Error: 21 - ' + e.toString());
    }
}

function cleanPeblObjectStyles() {

}

function createPeblObjectStyles() {
    try {
        var placeholderImageStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-placeholderImage');
        var extensionStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-extension');

        if (placeholderImageStyle == null) {
            placeholderImageStyle = app.activeDocument.objectStyles.add('peblIndesign-placeholderImage');
        }

        placeholderImageStyle.name = 'peblIndesign-placeholderImage';
        placeholderImageStyle.basedOn = app.activeDocument.objectStyles.itemByName('[Basic Graphics Frame]');
        placeholderImageStyle.objectStyleExportTagMaps.add('EPUB', 'p', 'peblIndesign-placeholderImage', '');
        placeholderImageStyle.objectExportOptions.preserveAppearanceFromLayout = PreserveAppearanceFromLayoutEnum.PRESERVE_APPEARANCE_USE_EXISTING_IMAGE;

        if (extensionStyle == null) {
            extensionStyle = app.activeDocument.objectStyles.add('peblIndesign-extension');
        }

        extensionStyle.name = 'peblIndesign-extension';
        extensionStyle.basedOn = app.activeDocument.objectStyles.itemByName('[Basic Graphics Frame]');
        extensionStyle.emitCss = false;
        extensionStyle.objectStyleExportTagMaps.add('EPUB', 'p', 'peblIndesign-extension', '');
        extensionStyle.strokeWeight = 0;
    } catch (e) {
        logToFile('PeBL Error: 20 - ' + e.toString());
        alert('PeBL Error: 20 - ' + e.toString());
    }
}

function tagContentMorphingBlocks(propertiesObject, anchorPoint) {
    try {
        var data = propertiesObject.data;
        for (var i = 0; i < data['data-levels'].length; i++) {
            var indesignId = parseInt(data['data-levelContentBlockIds'][i]);
            var contentMorphingId = data['data-levelContent'][i];
            var contentMorphingObjectStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-contentMorphing-' + contentMorphingId);
            if (contentMorphingObjectStyle == null) {
                contentMorphingObjectStyle = app.activeDocument.objectStyles.add('peblIndesign-contentMorphing-' + contentMorphingId);
            }
            contentMorphingObjectStyle.name = 'peblIndesign-contentMorphing-' + contentMorphingId;
            contentMorphingObjectStyle.basedOn = app.activeDocument.objectStyles.itemByName('[Basic Text Frame]');
            contentMorphingObjectStyle.enableStroke = false;
            contentMorphingObjectStyle.objectStyleExportTagMaps.add('EPUB', 'div', contentMorphingId + ' content-morphing-block', '');
            // contentMorphingObjectStyle.enableTextFrameAutoSizingOptions = true;
            // contentMorphingObjectStyle.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
            // contentMorphingObjectStyle.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT;
            // contentMorphingObjectStyle.textFramePreferences.useMinimumWidthForAutoSizing = true;
            // contentMorphingObjectStyle.textFramePreferences.minimumWidthForAutoSizing = '200 px';

            app.activeDocument.pageItems.itemByID(indesignId).appliedObjectStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-contentMorphing-' + contentMorphingId);
            app.activeDocument.pageItems.itemByID(indesignId).anchoredObjectSettings.insertAnchoredObject(anchorPoint, AnchorPosition.ANCHORED);
            app.activeDocument.pageItems.itemByID(indesignId).anchoredObjectSettings.verticalReferencePoint = VerticallyRelativeTo.TOP_OF_LEADING;
            //positionContentMorphingBlock(app.activeDocument.pageItems.itemByID(indesignIds[j]));
        }
    } catch (e) {
        logToFile('PeBL Error: 19 - ' + e.toString());
        alert('PeBL Error: 19 - ' + e.toString());
    }
}

function tagShowHideBlocks(propertiesObject, anchorPoint) {
    try {
        var data = propertiesObject.data;
        var indesignId = parseInt(data['data-content']);
        var showHideId = data['data-id'];

        var showHideObjectStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-showHide-' + showHideId);
        if (showHideObjectStyle == null) {
            showHideObjectStyle = app.activeDocument.objectStyles.add('peblIndesign-showHide-' + showHideId);
        }
        showHideObjectStyle.name = 'peblIndesign-showHide-' + showHideId;
        showHideObjectStyle.basedOn = app.activeDocument.objectStyles.itemByName('[Basic Text Frame]');
        showHideObjectStyle.enableStroke = false;
        showHideObjectStyle.objectStyleExportTagMaps.add('EPUB', 'div', showHideId + ' showHide-block', '');

        app.activeDocument.pageItems.itemByID(indesignId).appliedObjectStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-showHide-' + showHideId);
        app.activeDocument.pageItems.itemByID(indesignId).anchoredObjectSettings.insertAnchoredObject(anchorPoint, AnchorPosition.ANCHORED);
        app.activeDocument.pageItems.itemByID(indesignId).anchoredObjectSettings.verticalReferencePoint = VerticallyRelativeTo.TOP_OF_LEADING;
    } catch (e) {
        logToFile('PeBL Error: tagShowHideBlocks - ' + e.toString());
        alert('PeBL Error: tagShowHideBlocks - ' + e.toString());
    }
}

function aOverlapsB(a, b) {
    var aBounds = a.geometricBounds;
    var bBounds = b.geometricBounds;

    return !(bBounds[1] > aBounds[3] || bBounds[3] < aBounds[1] || bBounds[0] > aBounds[2] || bBounds[2] < aBounds[0]);
}

function positionContentMorphingBlock(textFrame) {
    try {
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.pixels;
        var frameBounds = textFrame.geometricBounds;
        var frameWidth = frameBounds[3] - frameBounds[1];
        var frameHeight = frameBounds[2] - frameBounds[0];
        textFrame.move([(-50 - frameWidth), 50]);
        var needsRepositioning = false;
        var maxY = 0;
        
        for (var i = 0; i < app.activeDocument.pageItems.count(); i++) {
            if (app.activeDocument.pageItems.item(i).name === 'Content Morphing Block' && app.activeDocument.pageItems.item(i).id !== textFrame.id) {
                if (app.activeDocument.pageItems.item(i).geometricBounds[2] > maxY) {
                    maxY = app.activeDocument.pageItems.item(i).geometricBounds[2];
                }
            }
        }

        app.findGrepPreferences = app.changeGrepPreferences = null;

        app.findGrepPreferences.findWhat = "~a";

        myFound = app.activeDocument.findGrep();

        for ( var i = 0; i < myFound.length; i++) {  
            if (myFound[i].textFrames[0].isValid && myFound[i].textFrames[0].name === 'Content Morphing Block') {
                if (myFound[i].textFrames[0].geometricBounds[2] > maxY) {
                    maxY = myFound[i].textFrames[0].geometricBounds[2];
                }
            }
        }  

        if (maxY > 0) {
            textFrame.move([(-50 - frameWidth), maxY + 20]);
        }
    } catch(e) {
        logToFile('PeBL Error: 18 - ' + e.toString());
        alert('PeBL Error: 18 - ' + e.toString());
    }
}

function previewHtml(html, slug) {
    try {
        var csxsEvent = new CSXSEvent();
        csxsEvent.type = "openPreviewPeblWindow";
        csxsEvent.data = JSON.stringify({html: unescape(html), slug: slug});
        csxsEvent.dispatch();
    } catch (e) {
        logToFile('PeBL Error: 17 - ' + e.toString());
        alert('PeBL Error: 17 - ' + e.toString());
    }
}

function staggerInsertedObject(initialBounds) {
    try {
        var pageItems = app.activeWindow.activePage.allPageItems;
        var needsAdjustment = false;

        for (var i = 0; i < pageItems.length; i++) {
            if (pageItems[i].name === "PeBL Extension") {
                if (pageItems[i].geometricBounds[0] === initialBounds[0] && pageItems[i].geometricBounds[1] === initialBounds[1]) {
                    // Need to stagger new one
                    initialBounds[0]+=8;
                    initialBounds[1]+=8;
                    initialBounds[2]+=8;
                    initialBounds[3]+=8;
                    needsAdjustment = true;
                    break;
                }
            }
        }

        if (needsAdjustment) {
            return staggerInsertedObject(initialBounds);
        } else {
            return initialBounds;
        }
    } catch (e) {
        logToFile('PeBL Error: 16 - ' + e.toString());
        alert('PeBL Error: 16 - ' + e.toString());
    }
}

function insertHtml(html, propertiesJSON, dependencies, selectedContentBehavior, imageMap) {
    try {
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.pixels;

        var myDocument = app.properties.activeDocument;
        var myPage = app.activeWindow.activePage;
        imageMap = JSON.parse(imageMap);

        var propertiesObject = JSON.parse(propertiesJSON);
        


        createPeblObjectStyles();

        var insertionPoint = myPage;
        var placeholderProperties = {};
        placeholderProperties.geometricBounds = staggerInsertedObject([8,8,9,9]);
        placeholderProperties.horizontalScale = 100;
        placeholderProperties.verticalScale = 100;

        

        if (app.selection && app.selection.length > 0){
            for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                if (isText(app.selection[myCounter].constructor.name) && selectedContentBehavior === 'replace') {
                    app.selection[myCounter].remove();
                    insertionPoint = app.selection[myCounter];
                    delete placeholderProperties.geometricBounds;
                }
                if (app.selection[myCounter].constructor.name === 'InsertionPoint') {
                    insertionPoint = app.selection[myCounter];
                    delete placeholderProperties.geometricBounds;
                }
            }
        }

        var myRectangle = insertionPoint.rectangles.add(undefined, undefined, undefined, placeholderProperties);
        //Save the id of this new object for later retrieval
        propertiesObject.editorObjectId = myRectangle.id;

        var peblObjectProperties = {};
        peblObjectProperties.imageMap = imageMap;
        peblObjectProperties.dataProperties = propertiesObject;
        
        myRectangle.name = "PeBL Extension";
        myRectangle.label = JSON.stringify(peblObjectProperties);
        myRectangle.appliedObjectStyle = app.activeDocument.objectStyles.itemByName('peblIndesign-extension');
        myRectangle.fillColor = myDocument.swatches.itemByName('Paper');



        if (propertiesObject.type === 'contentmorphing') {
            tagContentMorphingBlocks(propertiesObject, insertionPoint);
        } else if (propertiesObject.type === 'showHide') {
            tagShowHideBlocks(propertiesObject, insertionPoint);
        }

        var myHtml = myRectangle.htmlItems.add(undefined, undefined, undefined, placeholderProperties);

        setTimeout(function() {
            myHtml.htmlContent = unescape(html);
            refreshPeblContentWindow();
            progress.close();
            selectPeblExtension(myRectangle.id);
            setTimeout(function() {
                myRectangle.frameFittingOptions.autoFit = true;
                myRectangle.frameFittingOptions.fittingAlignment = AnchorPoint.CENTER_ANCHOR;
                myRectangle.frameFittingOptions.fittingOnEmptyFrame = EmptyFrameFittingOptions.PROPORTIONALLY;
            }, 3000);
        }, 5000);
        progress(5000);
        progress.message('Creating PeBL Extension');

        emitSetEpubExportOptions();

        insertPlaceholderImages(imageMap);

        return '';
    } catch (e) {
        logToFile('PeBL Error: 15 - ' + e.toString());
        alert('PeBL Error: 15 - ' + e.toString());
    }   
}

function updateHtml(html, propertiesJSON, dependencies, imageMap) {
    try {
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.pixels;
        var propertiesObject = JSON.parse(propertiesJSON);
        if (propertiesObject.editorObjectId) {
            selectPeblExtension(propertiesObject.editorObjectId);
        }

        var insertionPoint = app.activeWindow.activePage;

        imageMap = JSON.parse(imageMap);

        var peblObjectProperties = {};
        peblObjectProperties.imageMap = imageMap;
        peblObjectProperties.dataProperties = propertiesObject;

        if (app.documents.length != 0){
            if (app.selection.length > 0){
                for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                    if (app.selection[myCounter].constructor.name === "Rectangle" && app.selection[myCounter].name == "PeBL Extension") {
                        if (propertiesObject.type === 'contentmorphing')
                            insertionPoint = app.selection[myCounter].parent.insertionPoints[0];
                        app.selection[myCounter].label = JSON.stringify(peblObjectProperties);
                        app.selection[myCounter].htmlItems.item(0).htmlContent = unescape(html);
                        refreshPeblContentWindow();
                    }
                }
            }
        }

        
        if (propertiesObject.type === 'contentmorphing') {
            tagContentMorphingBlocks(propertiesObject, insertionPoint);
        } else if (propertiesObject.type === 'showHide') {
            tagShowHideBlocks(propertiesObject, insertionPoint);
        }

        insertPlaceholderImages(imageMap);
    } catch (e) {
        logToFile('PeBL Error: 3 - ' + e.toString());
        alert('PeBL Error: 3 - ' + e.toString());
    }
    
}

function verifyInsertionPointNotContentMorphingBlock() {
    try {
        if (app.selection && app.selection.length > 0){
            for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                if (app.selection[myCounter].constructor.name === 'InsertionPoint') {
                    if (app.selection[myCounter].parentTextFrames && app.selection[myCounter].parentTextFrames[0].name === 'Content Morphing Block') {
                        return false;
                    }
                    return true;
                } else if (isText(app.selection[myCounter].constructor.name)) {
                    if (app.selection[myCounter].parentTextFrames && app.selection[myCounter].parentTextFrames[0].name === 'Content Morphing Block') {
                        return false;
                    }
                    return true;
                }
            }
        }
        return false;
    } catch (e) {
        logToFile('PeBL Error: 14b - ' + e.toString());
        alert('PeBL Error: 14b - ' + e.toString());
    }
}

function verifyInsertionPoint() {
    try {
        if (app.selection && app.selection.length > 0){
            for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                if (app.selection[myCounter].constructor.name === 'InsertionPoint') {
                    return true;
                } else if (isText(app.selection[myCounter].constructor.name)) {
                    return true;
                }
            }
        }
        return false;
    } catch (e) {
        logToFile('PeBL Error: 14a - ' + e.toString());
        alert('PeBL Error: 14a - ' + e.toString());
    }  
}

function getPeblSettings() {
    try {
        var peblSettings = '';
        if (app.activeDocument && app.activeDocument.label.length > 0) {
            peblSettings = app.activeDocument.label;
        }
        return peblSettings;
    } catch (e) {
        logToFile('PeBL Error: 13 - ' + e.toString());
        alert('PeBL Error: 13 - ' + e.toString());
    }
}

function savePeblSettings(stringifiedSettingsObject) {
    try {
        if (app.activeDocument) {
            app.activeDocument.label = stringifiedSettingsObject;
        }
        emitSetEpubExportOptions();
        return stringifiedSettingsObject;
    } catch (e) {
        logToFile('PeBL Error: 12 - ' + e.toString());
        alert('PeBL Error: 12 - ' + e.toString());
    }
}

function getPeblExtensions() {
    try {
        var extensions = [];
        if (app.documents.length != 0) {
            var doc = app.activeDocument;
            for (var i = 0; i < doc.allPageItems.length; i++) {
                if (doc.allPageItems[i].constructor && doc.allPageItems[i].constructor.name === "Rectangle" && doc.allPageItems[i].name && doc.allPageItems[i].name == "PeBL Extension" && doc.allPageItems[i].parentPage) {
                    var pageNumber = doc.allPageItems[i].parentPage.documentOffset;
                    var id = doc.allPageItems[i].id;
                    var extensionData = JSON.parse(doc.allPageItems[i].label);
                    var extensionObj = {
                        id: id,
                        page: pageNumber,
                        type: extensionData.dataProperties.name,
                        name: extensionData.dataProperties.title,
                        data: extensionData
                    }
                    extensions.push(extensionObj);
                }
            }

            app.findGrepPreferences = app.changeGrepPreferences = null;

            app.findGrepPreferences.findWhat = "~a";

            myFound = app.activeDocument.findGrep();

            for ( var i = 0; i < myFound.length; i++) {  
                if (myFound[i].textFrames[0].isValid && myFound[i].textFrames[0].name === 'Content Morphing Block') {
                    var tf = myFound[i].textFrames[0];
                    for (var j = 0; j < tf.allPageItems.length; j++) {
                        if (tf.allPageItems[j].constructor.name === "Rectangle" && tf.allPageItems[j].name == "PeBL Extension") {
                            var pageNumber = 'N/A';
                            var id = tf.allPageItems[j].id;
                            var extensionData = JSON.parse(tf.allPageItems[j].label);
                            var extensionObj = {
                                id: id,
                                page: pageNumber,
                                type: extensionData.dataProperties.name,
                                name: extensionData.dataProperties.title,
                                data: extensionData
                            }
                            extensions.push(extensionObj);
                        }
                    }
                }
            }

            return JSON.stringify(extensions);
        }
    } catch(e) {
        logToFile('PeBL Error: 11 - ' + e.toString());
        alert('PeBL Error: 11 - ' + e.toString());
    }
}

function selectPeblExtension(id) {
    try {
        if (app.documents.length != 0) {
            var doc = app.activeDocument;

            for (var i = 0; i < doc.allPageItems.length; i++) {
                if (doc.allPageItems[i].id == id) {
                    doc.allPageItems[i].select();
                    break;
                }
            }
        }
    } catch(e) {
        logToFile('PeBL Error: 10 - ' + e.toString());
        alert('PeBL Error: 10 - ' + e.toString());
    }
}

function removePeblExtension(id) {
    try {
        selectPeblExtension(id);
        if (app.selection.length > 0){
            for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                if (app.selection[myCounter].constructor.name === "Rectangle" && app.selection[myCounter].name == "PeBL Extension") {
                    app.selection[myCounter].remove();
                    refreshPeblContentWindow();
                }
            }
        }
    } catch(e) {
        logToFile('PeBL Error: 9 - ' + e.toString());
        alert('PeBL Error: 9 - ' + e.toString());
    } 
}

function refreshPeblContentWindow() {
    try {
        var csxsEvent = new CSXSEvent();
        csxsEvent.type = "refreshPeblContentWindow";
        csxsEvent.dispatch();
    } catch(e) {
        logToFile('PeBL Error: 8 - ' + e.toString());
        alert('PeBL Error: 8 - ' + e.toString());
    }
}

function getSelectedContent() {
    try {
        var selectedFrame = '';
        var isFrames = false;
        if (app.selection.length > 0){
            for (var myCounter = 0; myCounter < app.selection.length; myCounter++){
                if (app.selection[myCounter].constructor.name === 'TextFrame') {
                    app.selection[myCounter].name = 'Content Morphing Block';
                    selectedFrame = app.selection[myCounter].id;
                    isFrames = true;
                    break;
                }
            }
            if (!isFrames) {
                app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels;
                app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.pixels;
                // Something other than a text frame is selected, cut and paste it into a new text frame.
                var contentMorphingObjectStyle = app.activeDocument.objectStyles.itemByName('tempContentMorphingBlock');
                if (contentMorphingObjectStyle == null) {
                    contentMorphingObjectStyle = app.activeDocument.objectStyles.add('tempContentMorphingBlock');
                }
                contentMorphingObjectStyle.name = 'tempContentMorphingBlock';
                contentMorphingObjectStyle.basedOn = app.activeDocument.objectStyles.itemByName('[Basic Text Frame]');
                contentMorphingObjectStyle.enableStroke = false;
                // contentMorphingObjectStyle.enableTextFrameAutoSizingOptions = true;
                // contentMorphingObjectStyle.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
                // contentMorphingObjectStyle.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT;
                // contentMorphingObjectStyle.textFramePreferences.useMinimumWidthForAutoSizing = true;
                // contentMorphingObjectStyle.textFramePreferences.minimumWidthForAutoSizing = '200 px';

                app.cut();
                var newTextFrame = app.activeDocument.layoutWindows[0].activePage.textFrames.add(undefined, undefined, undefined, {geometricBounds: [1,1,50,200]});
                newTextFrame.appliedObjectStyle = app.activeDocument.objectStyles.itemByName('tempContentMorphingBlock');
                newTextFrame.name = 'Content Morphing Block';
                
                newTextFrame.insertionPoints.item(0).select();
                app.paste();
                selectedFrame = newTextFrame.id;
                app.activeWindow.screenMode = ScreenModeOptions.PREVIEW_OFF;
                // newTextFrame.fit(FitOptions.FRAME_TO_CONTENT);
                positionContentMorphingBlock(newTextFrame);
                app.activeDocument.select(NothingEnum.NOTHING);
            }
        }

        return '' + selectedFrame;
    } catch (e) {
        logToFile('PeBL Error: 7 - ' + e.toString());
        alert('PeBL Error: 7 - ' + e.toString());
    }
}

function contentBlocksExist(arrayOfIds) {
    try {
        var arrayOfIds = JSON.parse(arrayOfIds);

        var arrayOfMissingIds = [];

        app.findGrepPreferences = app.changeGrepPreferences = null;

        app.findGrepPreferences.findWhat = "~a";

        myFound = app.activeDocument.findGrep();

        for (var i = 0; i < arrayOfIds.length; i++) {
            var found = false;
            for ( var j = 0; j < myFound.length; j++) {  
                if (myFound[j].textFrames[0].isValid && myFound[j].textFrames[0].name === 'Content Morphing Block' && myFound[j].textFrames[0].id == arrayOfIds[i]) {
                      found = true;
                      break;
                }
            }
            if (!found) {
                arrayOfMissingIds.push(arrayOfIds[i]);
            }
        }

        return JSON.stringify(arrayOfMissingIds);
    } catch(e) {
        logToFile('PeBL Error: 6 - ' + e.toString());
        alert('PeBL Error: 6 - ' + e.toString());
    }
}

function goToPage(page) {
    try {
        app.activeDocument.layoutWindows[0].activePage = app.activeDocument.pages[page];
    } catch (e) {
        logToFile('PeBL Error: 5 - ' + e.toString());
        alert('PeBL Error: 5 - ' + e.toString());
    }
}

function myGetBounds(myDocument, myPage) {
    try {
        myDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels;
        myDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.pixels;
        var myPageWidth = myDocument.documentPreferences.pageWidth;
        var myPageHeight = myDocument.documentPreferences.pageHeight;
        if (myPage.side == PageSideOptions.leftHand) {
            var myX2 = myPage.marginPreferences.left;
            var myX1 = myPage.marginPreferences.right;
        } else {
            var myX1 = myPage.marginPreferences.left;
            var myX2 = myPage.marginPreferences.right;
        }
        var myY1 = myPage.marginPreferences.top;
        var myX2 = myPageWidth - myX2;
        var myY2 = myPageHeight - myPage.marginPreferences.bottom;
        return [myY1, myX1, myY2, myX2];
    } catch(e) {
        logToFile('PeBL Error: 4 - ' + e.toString());
        alert('PeBL Error: 4 - ' + e.toString());
    }
}

function progress(steps) {

    var b;

    var t;

    var w;

    w = new Window("palette", "", undefined, {closeButton: false});

    t = w.add("statictext");

    t.preferredSize = [450, -1]; // 450 pixels wide, default height.

    if (steps) {

        b = w.add("progressbar", undefined, 0, steps);

        b.preferredSize = [450, -1]; // 450 pixels wide, default height.

        setTimeout(function() {
            b.value = steps / 5;
        }, 1000);

        setTimeout(function() {
            b.value = (2 * steps) / 5;
        }, 2000);

        setTimeout(function() {
            b.value = (3 * steps) / 5;
        }, 3000);

        setTimeout(function() {
            b.value = (4 * steps) / 5;
        }, 4000);
    }

    progress.close = function () {

        w.close();

    };

    progress.increment = function () {

        b.value++;

    };

    progress.message = function (message) {

        t.text = message;

    };

    w.show();

}


function logToFile(message, needsUnescape) {
    if (needsUnescape)
        message = unescape(message);

    var path = Folder.temp.fullName + '/peblIndesign-errorLog.txt';
    var file = File(path);

    if (!file.exists) {
        file = new File(path);
    }

    var output = file.open('a', undefined, undefined);
    file.encoding = "UTF-8";
    file.lineFeed = "Unix";

    var timestamp = new Date().toString();

    file.writeln(timestamp + ' - ' + message);
    file.close();
}