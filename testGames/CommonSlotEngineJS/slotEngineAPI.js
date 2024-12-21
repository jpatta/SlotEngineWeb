/* ---------------------------------------------------------
 sample supporting SlotEngine API functions
          
    relies on following "globals" (see gameTest.js):

     request
     gameState
     playerToken
     jwtToken
     server
     gameId
     bet
     denom
     roundId
     currencyId
     apiCallPermitted
     latitude
     longitude
     ipa
     casinoId
     mathsetGameId

    and calls (see gameTest.js):

     populateDisplayResult()
     restartTimer() 

 */

const SE_TIMEOUT = 90000;

function createSlotSessionAPIcall() {
    updateGPSLocation()
    var data = JSON.stringify({
      "playerToken": playerToken,
      "currencyId": currencyId,
      "gameStudio": "Demo",
      "APIkey": "Demo0001!",
      "casinoId": casinoId,
      "mathsetGameId": mathsetGameId
    });
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = SE_TIMEOUT;
    xhr.ontimeout = function (e) {
      msg.textContent = "createSlotSessionAPIcall timed out"
      apiCallPermitted = true;
    }
  
    xhr.onerror = function (ev) {
      msg.textContent = "Network Error. Please try again"
      apiCallPermitted = true;
    }
  
    xhr.open("POST", server+"/SE/"+ gameId + "/Session.php?cmd=create");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
      var data2 = JSON.parse(this.response)
      if (xhr.status >= 200 && xhr.status < 300) {
        
        // get the game session token
        jwtToken = data2.result.JWT
  
        restartTimer();
        
        // show initial values
        populateDisplayResult(data2.result.sessionData)
  
        if (gameState == 0) {
        // if game was initializing, get configuration  
          gameState = 1
          getConfigAPIcall(data2.result.sessionData)
        }
  
        if (gameState == 3) {
          // if game had an expired session, reset the state 
          // and proceed with the request...
        
          gameState = 2
          switch(request) {
            case "play":
            case "replay":
              playAPIcall(roundId)
              break;
            case "bet":
              betAPIcall(bet);
              break;
            case "denom":
              denomAPIcall(denom);
              break;  
            default:
          }
  
        } else if (gameState == 2 && request == "change") {
            apiCallPermitted = true;
        }
  
      } else {
        msg.textContent = data2.result
      }
    }
    xhr.send(data)
  }

  function createTableSessionAPIcall() {
    updateGPSLocation()
    var data = JSON.stringify({
      "playerToken": playerToken,
      "currencyId": currencyId,
      "gameStudio": "Demo",
      "APIkey": "Demo0001!",
      "casinoId": casinoId,
      "tableId": tableId,
      "allowNewTable": true,
      "mathsetGameId": mathsetGameId
    });
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = SE_TIMEOUT;
    xhr.ontimeout = function (e) {
      msg.textContent = "createTableSessionAPIcall timed out"
      apiCallPermitted = true;
    }
  
    xhr.onerror = function (ev) {
      msg.textContent = "Network Error. Please try again"
      apiCallPermitted = true;
    }
  
    xhr.open("POST", server+"/SE/"+ gameId + "/Session.php?cmd=create");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
      var data2 = JSON.parse(this.response)
      if (xhr.status >= 200 && xhr.status < 300) {
        
        // get the game session token
        jwtToken = data2.result.JWT
  
        restartTimer();
  
        if (gameState == 0) {
        // if game was initializing, get configuration  
          gameState = 1
          getConfigAPIcall(data2.result.sessionData)
        }
  
        if (gameState == 3) {
          // if game had an expired session, reset the state 
          // and proceed with the request...
        
          gameState = 2
          switch(request) {
            case "play":
            case "replay":
              playAPIcall(roundId)
              break;
            case "bet":
              betAPIcall(bet);
              break;
            case "denom":
              denomAPIcall(denom);
              break;  
            default:
          }
  
        }
  
      } else {
        msg.textContent = data2.result
      }
    }
    xhr.send(data)
  }
  
  
  function playAPIcall(replayId) {
    var data = ""
    data = {
      "latitude": latitude,
      "longitude": longitude,
      "IPA": ipa,
      "state": "Nevada",
      "country": "USA"
      }
    if (request == "replay") {
      data.replay = replayId
    }

    if (!(typeof gaffArray === 'undefined')) {
      data.gaffArray = gaffArray
    }
    
    data = JSON.stringify(data)
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = SE_TIMEOUT;
    xhr.ontimeout = function (e) {
      msg.textContent = "playAPIcall timed out"
      apiCallPermitted = true;
    }
  
    xhr.onerror = function (ev) {
      msg.textContent = "Network Error. Please try again"
      apiCallPermitted = true;
    }
    
    xhr.open("POST", server + "/SE/"+ gameId + "/Play.php");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + jwtToken);
  
    xhr.onload = function() {
      var data2 = JSON.parse(this.response)
      if (xhr.status >= 200 && xhr.status < 300) {
        populateDisplayResult(data2.result)
        apiCallPermitted = true
  
      } else {
        if (data2.status == 119) {
        // session expired. change state and get  token
            gameState = 3
            if (tableId) {
                createTableSessionAPIcall()
            } else {
                createSlotSessionAPIcall()
            }
        } else {
            msg.textContent = data2.result
            apiCallPermitted = true
        }
      }
  
    }
    xhr.send(data)
  }
  
  
  function betAPIcall(data) {
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = SE_TIMEOUT;
    xhr.ontimeout = function (e) {
      msg.textContent = "betAPIcall timed out"
      apiCallPermitted = true;
    }
  
    xhr.onerror = function (ev) {
      msg.textContent = "Network Error. Please try again"
      apiCallPermitted = true;
    }
    
    xhr.open("POST", server + "/SE/"+ gameId + "/Bet.php");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + jwtToken);
  
    xhr.onload = function() {
      var data2 = JSON.parse(this.response)
      if (xhr.status >= 200 && xhr.status < 300) {
        populateDisplayResult(data2.result)
        apiCallPermitted = true
  
      } else {
        if (data2.status == 119) {
        // session expired. change state and get token
            gameState = 3
            if (tableId) {
                createTableSessionAPIcall()
            } else {
                createSlotSessionAPIcall()
            }
        } else {
            betError(data2)
            apiCallPermitted = true
        }
      }
    }
    xhr.send(data)
  }
  
  
  function denomAPIcall() {
    var data = ""
    data = JSON.stringify({
      "denom": denom
    }) 
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = SE_TIMEOUT;
    xhr.ontimeout = function (e) {
      msg.textContent = "denomAPIcall timed out"
      apiCallPermitted = true;
    }
  
    xhr.onerror = function (ev) {
      msg.textContent = "Network Error. Please try again"
      apiCallPermitted = true;
    }
    
    xhr.open("POST", server + "/SE/"+ gameId + "/Denom.php");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + jwtToken);
  
    xhr.onload = function() {
      var data2 = JSON.parse(this.response)
      if (xhr.status >= 200 && xhr.status < 300) {
        populateDisplayResult(data2.result)
        apiCallPermitted = true
  
      } else {
        if (data2.status == 119) {
        // session expired. change state and get new token
            gameState = 3
            if (tableId) {
                createTableSessionAPIcall()
            } else {
                createSlotSessionAPIcall()
            }
        } else {
            msg.textContent = data2.result
            apiCallPermitted = true
        }
      }
    }
    xhr.send(data)
  }
  
  
  function getConfigAPIcall(sessionData) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = SE_TIMEOUT;
    xhr.ontimeout = function (e) {
      msg.textContent = "getConfigAPIcall timed out. check server. reload game."
      if (gameState == 1) {
        // if game session was just created, reset the state to 0, forcing getConfig on next create   
          gameState = 0
      }
    }
  
    xhr.onerror = function (ev) {
      msg.textContent = "Network Error. Please try again"
      if (gameState == 1) {
          gameState = 0
      }
    }
  
    xhr.open("GET", server + "/SE/"+gameId+"/Config.php?cmd=get");
    xhr.setRequestHeader("Authorization", "Bearer " + jwtToken);
    
    xhr.onload = function() {
      var data2 = JSON.parse(this.response)
      if (xhr.status >= 200 && xhr.status < 300) {
        
        /* parse needed game config data...
         in the test example, we're not doing much...
        ...this is where you'd get the paytable details, etc.
        */
  
          configureGame(data2);
  
        if (gameState == 1) {
        // if game session was just created, change state to ready   
          gameState = 2
          apiCallPermitted = true;
        }

        //if (request == "init" && gameState == 2) {
        //  populateDisplayResult(sessionData)
        //}

        
      } else {  
        msg.textContent = data2.result
        if (gameState == 1) {
            gameState = 0
        }
      }
    }
    xhr.send()
  }
  