
var handleResponse = function(responseText)
{
    response = JSON.parse(responseText);
    console.log("Response from server: ");
    console.log(response);
}

var sendRequest = function(packageName, className, methodName, plainStr, page=0)
{
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  xmlhttp.open("POST", "http://localhost:1234/jfdnasjfd");
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  var dict = {}

  if (packageName != null)
    dict["package"] = packageName;
  if (className != null)
    dict["class"] = className;
  if (methodName != null)
    dict["method"] = methodName;
  if (plainStr != null)
    dict["token"] = plainStr;
  dict["page"] = page;


  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
         if(xmlhttp.status == 200){
            handleResponse(xmlhttp.responseText);
         }
         else if(xmlhttp.status == 400) {
            console.log("Error 400 returned from server");
         }
         else {
           console.log("Error returned from serve");
         }
      }
  };

  xmlhttp.send(JSON.stringify(dict));
}
