// game test script, js


// Game1 is a "ways" game, with wilds, freespins and has a multilevel progressive jackpot (configurable as standalone or linked (default)), and a jackpot game to play, when triggerred.

// Code here does not do any animation. It shows outcome as plain text. It does however implement and demonstrate the entire API conversation with the RGS of a fully functional, relased slot game


//---------------------------------------------------------
// initialization
//

const msg = document.getElementById('gamemsg')

// rgs installation
var server = "https://api.rdsergs.com"

// typically playerToken is passed by calling casino website
//  -- here we just pick a random token from our available demo token pool
// var playerToken = 'tokendemoPlayer' + (1 + Math.floor(Math.random() * Math.floor(1000)));
var playerToken = '12345678901';
document.getElementById("playerToken").value = playerToken


// currency would also be passed by calling website
var currencyId = 'USD'

// this is the default denomation (value of 1 credit) for this currency
var denom = 0.01

// this game's gameId to access on the RGS server
var gameId = "Game1"

// this is the mathsetid, passed by casino website, for specific PAR mathset
var mathsetGameId = "Game1_97_v1"

// this is the casino identifier of the installation. usually passed by casino website
var casinoId = "onlinecasino1"

// this are either passed or obtained within...
var latitude = "000.000000"
var longitude = "000.000000"
var ipa = "000.000.000.000"


var roundId = "0"
var jwtToken = ""
var apiCallPermitted = false
var request = ""
var countMinutes = 15*60000
var countDownDate;
var mTimer

var gameState = 0;
/*  
    0 initial state
    1 session created
    2 game configured / ready 
    3 token expired
*/

msg.textContent = 'Spin to Play'

// all betting is in credits. internally, at rgs, all accounting is in cash.
// for "ways" games, bet strucuture is this:
var bet = 50
var multiplier = 1

// for line games:
/*
var betPerLine = 1
var linesBet = 50
*/

// display initial values
document.getElementById("betField").value = bet
document.getElementById("denomField").value = denom
document.getElementById("betMultiplier").value = multiplier


// initialize Game1: create the session and session JWT token. 
// If this is a returning player to the same game, game will be restored.
// If it is a new player (token) or a different game, never played, it will be initialized

request = "init"
createSlotSessionAPIcall();


//---------------------------------------------------------
// main user input handling / game loop
//


function playerPlay() {
  if (apiCallPermitted) {
    apiCallPermitted = false
    request = "play"
    if (gameState == 3 || gameState == 0) {
      // session timer may have expired...or getConfig/init failed
      createSlotSessionAPIcall()
    } else {
      playAPIcall("")   
    }
  } else {
    msg.textContent = 'Play not permitted yet'
  }
}


function playerBet() {
  if (apiCallPermitted) {
    apiCallPermitted = false 
    request = "bet"
    bet = document.getElementById("betField").value
    multiplier = document.getElementById("betMultiplier").value

    // since this game is a ways game, it has this bet structure:
    data = JSON.stringify({
      "baseBet": bet, 
      "betMultiplier": multiplier
    }) 
    
    /* #for a line game, it would have this structure:
    data = JSON.stringify({
      "betPerLine": betPerLine,
      "linesBet": linesBet
      "betMultiplier": multiplier
    })
    */

    if (gameState == 3 || gameState == 0) {
        createSlotSessionAPIcall()
    } else {
        betAPIcall(data)  
    }    
  } else {
    msg.textContent = 'Bet not permitted yet'
  }
}


function playerDenom() {
  if (apiCallPermitted) {
    apiCallPermitted = false
    request = "denom"
    denom = document.getElementById("denomField").value
    if (gameState == 3 || gameState == 0) {
        createSlotSessionAPIcall()
      } else {
        denomAPIcall(denom)  
    } 
  } else {
    msg.textContent = 'Denom not permitted yet'
  }
}


function playerReplay() {
  if (apiCallPermitted) {
    apiCallPermitted = false
    request = "replay"
    if (gameState == 3 || gameState == 0) {
      createSlotSessionAPIcall()
    } else {
      playAPIcall(roundId)   
    }
  } else {
    msg.textContent = 'Play not permitted yet'
  }
}

function tokenChange() {
    if (apiCallPermitted) {
        playerToken = document.getElementById("playerToken").value
        apiCallPermitted = false
        request = "change"
        createSlotSessionAPIcall() 
    } else {
      msg.textContent = 'Token Change not permitted yet'
    }
  }


function updateGPSLocation() {
  navigator.geolocation.getCurrentPosition(function(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  });
}

/*---------------------------------------------------------
all game output to browser html is handled here          
*/


function populateDisplayResult(resultOutcome) {

  updateGPSLocation()

  // display the rng result
  n = 0;
  resultOutcome.gameOutcome.randomReelStops.forEach(rndInt => {
    n++
    document.getElementById('td'+n).innerText = rndInt
  })

  // get the outcome values applied
  document.getElementById('bet').innerText = resultOutcome.gameOutcome.creditsBet
  document.getElementById('won').innerText = resultOutcome.gameOutcome.creditsWon
  document.getElementById('balance').innerText = resultOutcome.creditsBalance

  document.getElementById("betField").value = resultOutcome.gameOutcome.betStructure.baseBet
  document.getElementById("betMultiplier").value = resultOutcome.gameOutcome.betStructure.betMultiplier
  document.getElementById("denomField").value = resultOutcome.creditsDenom
  

  ipa = resultOutcome.playerLocation.serverReportedIPA
  denom = resultOutcome.creditsDenom
  bet = resultOutcome.gameOutcome.betStructure.baseBet
  multiplier = resultOutcome.gameOutcome.betStructure.betMultiplier

  if (resultOutcome.gameRoundId) {
    roundId = resultOutcome.gameRoundId
  } else {
    roundId = ""
  }

  //display basic info
  document.getElementById('roundid').innerText = 'Round Id: ' + roundId
  document.getElementById("details").innerText = 'IPA: ' + ipa + ", GPS: " + latitude + ":" + longitude


  // display an outcome message
  if (request == "replay") {
    replayedText = "Replayed roundId " + roundId + ". "
  } else {
    replayedText = ""
  }
  
  if (request == "init" && roundId > "") {
    msg.textContent = "Welcome back!"
  } else if (resultOutcome.gameOutcome.creditsWon > 0 && (request == "play" || request == "replay")) {
    msg.textContent = replayedText + "You won " + resultOutcome.gameOutcome.creditsWon + " credits"
  } else {
    msg.textContent = replayedText + "Game Over" 
  }

  if (request == "bet") {
    msg.textContent = "Bet Processed. Total Bet: " + resultOutcome.gameOutcome.betStructure.totalBetCredits + "."

  } else if (request == "denom") {
    msg.textContent = "Denom Processed. Total Bet: " + resultOutcome.gameOutcome.betStructure.totalBetCredits + "."

  } else if ((request == "replay" || request == "play") && gameState == 2 && Object.keys(resultOutcome.gameOutcome.freespinsOutcome).length > 0) {
    msg.textContent = "Freespin. " + msg.textContent + ". Freespins remaining " + resultOutcome.gameOutcome.freespinsOutcome.freespinsRemaining + "."
  }

  // The jackpot game information is extensive. See resultOutcome.gameOutcome.jackpotsOutcome collection. 
  // It returns the entire sequence of jackpot "game" play. The game client will 
  // engage the player in picking from 15 hidden items on the screen, which upon pick will reveal themsleves. 
  // The jackpot game is over when the player matches 3 equal items. The corresponding jackpot level is awarded. 
  // Since the outcome is server pre-determined, this player interaction is purely a client visual exercise, 
  // where for each player pick, the game client should reveal the next item from the jackpotsOutcome collection. 
  // Eventually, the game client can reveal the final prize. 

  // Note: The code here below, does not do this: it just displays the final jackpot win.

  if ((request == "play" || request == "replay") && resultOutcome.sessionState == 9) {
     msg.textContent = msg.textContent + " Jackpot Won: " + resultOutcome.gameOutcome.jackpotsOutcome.Game1_97_v1.wins[0].hit + " " + resultOutcome.gameOutcome.jackpotsOutcome.Game1_97_v1.wins[0].amount + " cash."
  }

  // display the symbols for all reels and rows
  r = 0; l = 0
  resultOutcome.gameOutcome.outcomeGrid.forEach(reel => {
    l = 0
    reel.forEach(cell => {
      cid = 'r'+r+'l'+l
      Object.entries(cell).forEach(([key, val]) => {
        document.getElementById(cid).innerText = key
      })
      l++
    })
    r++
  })

  // jackpot values display
  document.getElementById('GRAND').innerText = resultOutcome.jackpots.GRAND
  document.getElementById('MAJOR').innerText = resultOutcome.jackpots.MAJOR
  document.getElementById('MINI').innerText = resultOutcome.jackpots.MINI
  document.getElementById('MINOR').innerText = resultOutcome.jackpots.MINOR

}

function configureGame(configData) {
  denomsAllowed = configData.result.denomsAllowed
  waysBetsAllowed = configData.result.waysBetsAllowed
  basepaytable = configData.result.basepaytable
  freespinspaytable = configData.result.freespinspaytable
}

/* session expiry timer, to automate refresh token request
   every 15 minutes. display update every second
*/

function restartTimer() {
  countDownDate = new Date().getTime() + countMinutes;
  mTimer = setInterval(function() {
    // setup a visual countdown timer for monitoring token life
      var now = new Date().getTime();
      var distance = countDownDate - now;
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      document.getElementById("countdown").innerText = "Session Expires in " + minutes + "m " + seconds + "s ";
      if (distance < 0) {
        clearInterval(mTimer);
        document.getElementById("countdown").innerText = "Session Expired";
        //force next play request to get a new session token
        if (gameState > 1) gameState = 3;
      }
    }, 1000);    
}


