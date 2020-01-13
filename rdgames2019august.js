// demo site support script, js

function launchGame(id, gameURL) {
  if (playerToken) {
    var langItem = document.getElementById("langSelect");
    languageId = langItem.options[langItem.selectedIndex].value;
    window.location.href = gameURL + '/index.html?playerToken=' + playerToken + '&currencyId=' + currencyId + '&lang='+ languageId
  } else {
    alert('Player token not selected');
  }
}


const app = document.getElementById('games')

const container = document.createElement('div')
container.setAttribute('class', 'container')

var playerToken = 'tokendemoPlayer' + (1 + Math.floor(Math.random() * Math.floor(1000)));
var languageId = 'EN'
//EN,DE,ES,FR,IT,PL,RU,SE, TH, ZH

const currencyId = 'USD'

app.appendChild(container)

var request2 = new XMLHttpRequest()
request2.open('GET', 'https://www.rdsergs.com/SE/SlotEngineAdmin/API/SEGameList.php', true)
request2.setRequestHeader ("apikey", "QzVV6y1EmQFbbxOfRCwy77qa");
request2.onload = function() {
  // Begin accessing JSON data here
  var data2 = JSON.parse(this.response)
  if (request2.status >= 200 && request2.status < 400) {
    data2.response.result.gameServers.forEach(game => {
      if (data2.response.result.gameClients[game.idgame]) {
        const card = document.createElement('div')
        card.setAttribute('class', 'card')
        container.appendChild(card)

        /*const h1 = document.createElement('h1')
        h1.textContent = game.gameName
        card.appendChild(h1)*/

        /*const p = document.createElement('p')
        game.gameDescription = game.gameDescription.substring(0, 300)
        p.textContent = `${game.gameDescription}...`
        card.appendChild(p)*/

        const gameLogo = document.createElement('img')
        gameLogo.src = data2.response.result.gameResourceServer + '/' + data2.response.result.gameClients[game.idgame].logo
        gameLogo.style.maxWidth = "50%"
        if (game.gameStatus == 1) {
          gameLogo.onclick = function() { launchGame(this, data2.response.result.gameResourceServer + '/' + data2.response.result.gameClients[game.idgame].game) }
        } else {
          gameLogo.onclick = function() { alert ('Game is disabled')}
          const h2 = document.createElement('h2')
          h2.textContent = 'Game is Disabled'
          card.appendChild(h2)
        }
        card.appendChild(gameLogo)

        const gameDesign = document.createElement('img')
        var gameDesignPart = data2.response.result.gameClients[game.idgame].logo
        gameDesignPart = gameDesignPart.substring(gameDesignPart.lastIndexOf("/")+1,gameDesignPart.lastIndexOf("_"))
        gameDesign.src = data2.response.result.gameResourceServer + '/gameDesign/' + gameDesignPart + '.png'
        if (game.gameStatus == 1) {
          gameDesign.onclick = function() { launchGame(this, data2.response.result.gameResourceServer + '/' + data2.response.result.gameClients[game.idgame].game) }
        } else {
          gameDesign.onclick = function() { alert ('Game is disabled')}
        }

        card.appendChild(gameDesign)
      }
    })

  } else {
    const errorMessage = document.createElement('marquee')
    errorMessage.textContent = 'Request failed!'
    app.appendChild(errorMessage)
  }
}
request2.send()
