// ==UserScript==
// @name        CaTE: Bulk Mark Filler
// @namespace   https://github.com/edgemaster/cate-tools/
// @description Fills mark entry form with records from delimited pairs of uid,mark
// @include     https://cate.doc.ic.ac.uk/handinS.cgi?*
// @version     1
// @grant       none
// ==/UserScript==

function go() {
  // Find the mark entry form
  var form = document.body.lastChild;
  var xr = document.evaluate("//form[.//input[contains(@value, 'Re-order students')]]",
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  if(xr.singleNodeValue != null) {
    form = xr.singleNodeValue;
  }

  // Create our new form
  var markEntryDiv = document.createElement('ul');
  markEntryDiv.innerHTML = "<b>Bulk enter student marks in uid,mark pairs (T/CSV formats):</b><br/>";
  if (isGroupSubmission()) {
    markEntryDiv.innerHTML += "<i>(Only group leaders marks need to be submitted, other group members will be autofilled by CaTE)</i><br/>";
  }

  var textField = document.createElement('textarea');
  textField.style.width = "40em";
  textField.style.height = "100px";

  var button = document.createElement('button');
  button.innerHTML = "Fill marks";
  button.addEventListener("click", function() {

    var errors = new Array();
    var marks = parseMarks(textField.value, errors);
    marks.forEach(function (v) {insertMark(v, errors);});
    if(errors.length) {
      textField.value = errors.join("\n");
    } else {
      textField.value = "# All marks filled successfully";
    }

  });

  markEntryDiv.appendChild(textField);
  markEntryDiv.appendChild(button);

  form.parentElement.insertBefore(markEntryDiv, form);
}

function insertMark(markObj, errors) {
  var uid = markObj.uid;
  var mark = markObj.mark;

  var fieldSet = document.getElementsByName("addmark-"+uid);
  if (fieldSet.length != 1) {
    errors.push(uid + " " + mark + " # ERROR: Could not find uid");
  } else {
    if (fieldSet[0].value != "") {
      errors.push("# WARNING: Overwritten " + uid + " mark of " + fieldSet[0].value + ".");
    }
    fieldSet[0].value = mark;
  }
}

function parseMarks(string, errors) {
  string = string.toLowerCase();
  var regex = /([a-z]{2,3}\d{2,5})[ \t;:,]+(\d{1,3})/
  var lines = string.split(/[\r\n]+/);

  var marks = new Array();
  lines.forEach(function(v) {
    if (!v || v.charAt(0)=='#') return;

    var parsed = regex.exec(v);
    if (!parsed) {
      errors.push(v.split(' #')[0] + " # ERROR: Couldn't parse line");
    } else {
      marks.push({uid: parsed[1], mark: parsed[2]});
    }
  });

  return marks;
}

function isGroupSubmission() {
  var members = document.getElementsByName("members");
  return (members.length && members[0].value);
}

// CaTE has both handins.cgi and handinS.cgi they are different pages that have different functionality!
// Greasemonkey does case-insensitive path matching...
if (document.location.pathname.indexOf("handinS") != -1) {
  go();
}

