/* -----------------------------------------------------------------------------
*  Pi.Alert
*  Open Source Network Guard / WIFI & LAN intrusion detector 
*
*  pialert_common.js - Front module. Common Javascript functions
*-------------------------------------------------------------------------------
#  Puche 2021 / 2022+ jokob             jokob@duck.com                GNU GPLv3
----------------------------------------------------------------------------- */

// -----------------------------------------------------------------------------
var timerRefreshData = ''
var modalCallbackFunction = '';
var emptyArr            = ['undefined', "", undefined, null, 'null'];
var UI_LANG = "English";
var settingsJSON = {}


// urlParams = new Proxy(new URLSearchParams(window.location.search), {
//   get: (searchParams, prop) => searchParams.get(prop.toString()),
// });


// -----------------------------------------------------------------------------
// Simple session cache withe expiration managed via cookies
// -----------------------------------------------------------------------------
function getCache(key, noCookie = false)
{
  // check cache
  if(sessionStorage.getItem(key))
  {
    // check if not expired
    if(noCookie || getCookie(key + '_session_expiry') != "")
    {
      return sessionStorage.getItem(key);
    }
  }

  return "";  
}

// -----------------------------------------------------------------------------
function setCache(key, data, expirationMinutes='')
{
  sessionStorage.setItem(key, data);  

  // create cookie if expiration set to handle refresh of data
  if (expirationMinutes != '') 
  {
    setCookie (key + '_session_expiry', 'OK', expirationMinutes='')
  }
}


// -----------------------------------------------------------------------------
function setCookie (cookie, value, expirationMinutes='') {
  // Calc expiration date
  var expires = '';
  if (typeof expirationMinutes === 'number') {
    expires = ';expires=' + new Date(Date.now() + expirationMinutes *60*1000).toUTCString();
  } 

  // Save Cookie
  document.cookie = cookie + "=" + value + expires;
}

// -----------------------------------------------------------------------------
function getCookie (cookie) {
  // Array of cookies
  var allCookies = document.cookie.split(';');

  // For each cookie
  for (var i = 0; i < allCookies.length; i++) {
    var currentCookie = allCookies[i].trim();

    // If the current cookie is the correct cookie
    if (currentCookie.indexOf (cookie +'=') == 0) {
      // Return value
      return currentCookie.substring (cookie.length+1);
    }
  }

  // Return empty (not found)
  return "";
}


// -----------------------------------------------------------------------------
function deleteCookie (cookie) {
  document.cookie = cookie + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
}

// -----------------------------------------------------------------------------
function deleteAllCookies() {
  // Array of cookies
  var allCookies = document.cookie.split(";");

  // For each cookie
  for (var i = 0; i < allCookies.length; i++) {
    var cookie = allCookies[i].trim();
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
}




// -----------------------------------------------------------------------------
// Get settings from the .json file generated by the python backend
// -----------------------------------------------------------------------------
function cacheSettings()
{
  
  $.get('api/table_settings.json', function(res) { 
    
    settingsJSON = res;
        
    data = settingsJSON["data"];       

    data.forEach((set) => {      
      setCache(`pia_set_${set.Code_Name}`, set.Value) 
    });        
  })
}

function getSetting (key) {
 
  result = getCache(`pia_set_${key}`, true);

  if (result == "")
  {
    console.log(`Setting with key "${key}" not found`)
  }

  return result;
}

// -----------------------------------------------------------------------------
// Get language string
// -----------------------------------------------------------------------------
function cacheStrings()
{

  // handle core strings and translations
  var allLanguages        = ["en_us","es_es","de_de"]; // needs to be same as in lang.php

  allLanguages.forEach(function (language_code) {

    $.get(`php/templates/language/${language_code}.json`, function(res) {    

      Object.entries(res).forEach(([language, translations]) => {
          
          Object.entries(translations).forEach(([key, value]) => {              
              // store as key - value pairs in session
              setCache(`pia_lang_${key}_${language}`, value) 
          });
      });
     
    })
    
  });

  // handle strings and translations from plugins
  $.get('api/table_plugins_language_strings.json', function(res) {    
        
    data = res["data"];       

    data.forEach((langString) => {      
      setCache(`pia_lang_${langString.String_Key}_${langString.Language_Code}`, langString.String_Value) 
    });        
  })
  
}

function getString (key) {
 
  UI_LANG = getSetting("UI_LANG");

  lang_code = 'en_us';

  switch(UI_LANG)
  {
    case 'English': 
      lang_code = 'en_us';
      break;
    case 'Spanish': 
      lang_code = 'es_es';
      break;
    case 'German': 
      lang_code = 'de_de';
      break;
  }
  result = getCache(`pia_lang_${key}_${lang_code}`, true);


  if(isEmpty(result))
  {
    console.log(`pia_lang_${key}_${lang_code}`)
    console.log(key)    
    result = getCache(`pia_lang_${key}_en_us`, true);
    console.log(result)   
  
  }

  return result;
}

// -----------------------------------------------------------------------------
// Modal dialog handling
// -----------------------------------------------------------------------------
function showModalOk (title, message, callbackFunction = null) {
  // set captions
  $('#modal-ok-title').html   (title);
  $('#modal-ok-message').html (message); 
  
  if(callbackFunction!= null)
  {   
    $("#modal-ok-OK").click(function()
    { 
      callbackFunction()      
    });
  }

  // Show modal
  $('#modal-ok').modal('show');
}
function showModalDefault (title, message, btnCancel, btnOK, callbackFunction) {
  // set captions
  $('#modal-default-title').html   (title);
  $('#modal-default-message').html (message);
  $('#modal-default-cancel').html  (btnCancel);
  $('#modal-default-OK').html      (btnOK);
  modalCallbackFunction =          callbackFunction;

  // Show modal
  $('#modal-default').modal('show');
}

// -----------------------------------------------------------------------------

function showModalDefaultStrParam (title, message, btnCancel, btnOK, callbackFunction, param='') {
  // set captions
  $('#modal-str-title').html   (title);
  $('#modal-str-message').html (message);
  $('#modal-str-cancel').html  (btnCancel);
  $('#modal-str-OK').html      (btnOK);
  $("#modal-str-OK").off("click"); //remove existing handlers
  $('#modal-str-OK').on('click', function (){ 
    $('#modal-str').modal('hide');
    callbackFunction(param)
  })

  // Show modal
  $('#modal-str').modal('show');
}

// -----------------------------------------------------------------------------
function showModalWarning (title, message, btnCancel, btnOK, callbackFunction) {
  // set captions
  $('#modal-warning-title').html   (title);
  $('#modal-warning-message').html (message);
  $('#modal-warning-cancel').html  (btnCancel);
  $('#modal-warning-OK').html      (btnOK);
  modalCallbackFunction =          callbackFunction;

  // Show modal
  $('#modal-warning').modal('show');
}

// -----------------------------------------------------------------------------
function modalDefaultOK () {
  // Hide modal
  $('#modal-default').modal('hide');

  // timer to execute function
  window.setTimeout( function() {
    window[modalCallbackFunction]();
  }, 100);
}

// -----------------------------------------------------------------------------
function modalWarningOK () {
  // Hide modal
  $('#modal-warning').modal('hide');

  // timer to execute function
  window.setTimeout( function() {
    window[modalCallbackFunction]();
  }, 100);
}

// -----------------------------------------------------------------------------
function showMessage (textMessage="") {
  if (textMessage.toLowerCase().includes("error")  ) {
    // show error
    alert (textMessage);
  } else {
    // show temporal notification
    $("#alert-message").html (textMessage);
    $("#notification").fadeIn(1, function () {
      window.setTimeout( function() {
        $("#notification").fadeOut(500)
      }, 3000);
    } );
  }
}


// -----------------------------------------------------------------------------
// General utilities
// -----------------------------------------------------------------------------

// check if JSON object
function isJsonObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


// remove unnecessary lines from the result
function sanitize(data)
{
  return data.replace(/(\r\n|\n|\r)/gm,"").replace(/[^\x00-\x7F]/g, "")
}

// -----------------------------------------------------------------------------
function numberArrayFromString(data)
{
  data = JSON.parse(sanitize(data));
  return data.replace(/\[|\]/g, '').split(',').map(Number);
}

// -----------------------------------------------------------------------------
function setParameter (parameter, value) {
  // Retry
  $.get('php/server/parameters.php?action=set&parameter=' + parameter +
    '&value='+ value,
  function(data) {
    if (data != "OK") {
      // Retry
      sleep (200);
      $.get('php/server/parameters.php?action=set&parameter=' + parameter +
        '&value='+ value,
        function(data) {
          if (data != "OK") {
          // alert (data);
          } else {
          // alert ("OK. Second attempt");
          };
      } );
    };
  } );
}


// -----------------------------------------------------------------------------  
function saveData(functionName, id, value) {
  $.ajax({
    method: "GET",
    url: "php/server/devices.php",
    data: { action: functionName, id: id, value:value  },
    success: function(data) {      
        
        if(sanitize(data) == 'OK')
        {
          showMessage("Saved")
          // Remove navigation prompt "Are you sure you want to leave..."
          window.onbeforeunload = null;
        } else
        {
          showMessage("ERROR")
        }        

      }
  });

}


// -----------------------------------------------------------------------------
// remove an item from an array
function removeItemFromArray(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

// -----------------------------------------------------------------------------
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

// --------------------------------------------------------- 
somethingChanged = false;
function settingsChanged()
{
  somethingChanged = true;
  // Enable navigation prompt ... "Are you sure you want to leave..."
  window.onbeforeunload = function() {  
    return true;
  };
}

// -----------------------------------------------------------------------------
function getQueryString(key){
  params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  tmp = params[key] 
  
  result = emptyArr.includes(tmp) ? "" : tmp;

  return result
}  
// -----------------------------------------------------------------------------
function translateHTMLcodes (text) {
  if (text == null || emptyArr.includes(text)) {
    return null;
  } else if (typeof text === 'string' || text instanceof String)
  {
    var text2 = text.replace(new RegExp(' ', 'g'), "&nbsp");
    text2 = text2.replace(new RegExp('<', 'g'), "&lt");
    return text2;
  }

  return "";
}


// -----------------------------------------------------------------------------
function stopTimerRefreshData () {
  try {
    clearTimeout (timerRefreshData); 
  } catch (e) {}
}


// -----------------------------------------------------------------------------
function newTimerRefreshData (refeshFunction) {
  timerRefreshData = setTimeout (function() {
    refeshFunction();
  }, 60000);
}


// -----------------------------------------------------------------------------
function debugTimer () {
  $('#pageTitle').html (new Date().getSeconds());
}


// -----------------------------------------------------------------------------
function openInNewTab (url) {
  window.open(url, "_blank");
}


// -----------------------------------------------------------------------------
function navigateToDeviceWithIp (ip) {

  $.get('api/table_devices.json', function(res) {    
        
    devices = res["data"];

    mac = ""
    
    $.each(devices, function(index, obj) {
      
      if(obj.dev_LastIP.trim() == ip.trim())
      {
        mac = obj.dev_MAC;

        window.open(window.location.origin +'/deviceDetails.php?mac=' + mac , "_blank");
      }
    });
    
  });
}

// -----------------------------------------------------------------------------
function getNameByMacAddress(macAddress) {
  return getDeviceDataByMacAddress(macAddress, "dev_Name")
}

// -----------------------------------------------------------------------------
// 
function getDeviceDataByMacAddress(macAddress, dbColumn) {

  const sessionDataKey = 'devicesListAll_JSON';  
  const sessionData = sessionStorage.getItem(sessionDataKey);

  if (!sessionData) {
      console.log(`Session variable "${sessionDataKey}" not found.`);
      return "Unknown";
  }

  const devices = JSON.parse(sessionData);

  console.log(devices)

  for (const device of devices) {
      if (device["dev_MAC"].toLowerCase() === macAddress.toLowerCase()) {
          if ( device["dev_MAC"].toLowerCase() == 'd2:a4:1a:74:ae:86')
          {
            console.log(device)
          }

          return device[dbColumn];
      }
  }

  return "Unknown"; // Return a default value if MAC address is not found
}

// -----------------------------------------------------------------------------

function initDeviceListAll()
{ 

  $.get('php/server/devices.php?action=getDevicesList&status=all&forceDefaultOrder', function(data) {     

      rawData = JSON.parse (data)      

      devicesListAll = rawData["data"].map(item =>  { return {
                                                              "name":item[0], 
                                                              "type":item[2], 
                                                              "icon":item[3], 
                                                              "mac":item[11], 
                                                              "parentMac":item[14], 
                                                              "rowid":item[13], 
                                                              "status":item[10] 
                                                              }})

      setCache('devicesListAll', JSON.stringify(devicesListAll))
  });

}

var devicesListAll      = [];   // this will contain a list off all devices 
// -----------------------------------------------------------------------------

function initDeviceListAll_JSON()
{ 

  $.get('/api/table_devices.json', function(data) {    
    
    console.log(data)

    devicesListAll_JSON = data["data"]

    setCache('devicesListAll_JSON', JSON.stringify(devicesListAll_JSON))
  });

}

var devicesListAll_JSON      = [];   // this will contain a list off all devices 

// -----------------------------------------------------------------------------
function isEmpty(value)
{
  return emptyArr.includes(value)
}

// initialize
cacheSettings()
cacheStrings()
initDeviceListAll()
initDeviceListAll_JSON()


console.log("init pialert_common.js")


