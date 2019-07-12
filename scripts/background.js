/*
  Author: AresC
  Project: Boardfications
  Repository: https://github.com/Ares-C/Boardfications
*/
var notifications = []
var exists = []

var options = []

var notification = false

var championNameById = {}
var summonerSpellById = {}

var gameVersions = {}

var language = chrome.i18n.getMessage('@@ui_locale').substr(0, 2)
document.addEventListener('DOMContentLoaded', function () {
  var updateNotifications = function () {
    var xhr = new XMLHttpRequest()

    xhr.open('GET', `https://boards.${getRegion()}.leagueoflegends.com/${language}/myupdates.json?show=unread`, true)
    xhr.timeout = 5000
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (xhr.responseURL === `https://boards.${getRegion()}.leagueoflegends.com/${language}/myupdates.json?show=unread`) {
            try {
              var resp = JSON.parse(xhr.responseText)
            } catch (e) {
              updateBadge('LOGIN', true)
            };

            if (resp !== undefined) {
              var cache = resp
              var unread_notif = String(resp.searchResultsCount) || String(resp.resultsCount)
              updateBadge(unread_notif)
            }

            cache = cache.updates.replace(/<img\b[^>]*>/ig, '')
            cache = cache.replace(/href="(.*?)(?=".*?)/ig, `href="https://boards.${getRegion()}.leagueoflegends.com$1`)

            var html = document.createElement('html')
            html.innerHTML = cache

            var a = html.getElementsByClassName('update-item')

            for (var i = 0; i < a.length; i++) {
              var item = a[i]

              var board = item.getAttribute('data-application-id')
              var discussion = item.getAttribute('data-discussion-id')
              var comment = item.getAttribute('data-comment-id')

              var parentComment = (item.children[0].getElementsByClassName('content')[0].textContent).trim() // dont save
              var parentDiscussion = item.children[0].getElementsByTagName('a')[0].textContent
              var parentDiscussionUrl = item.children[0].getElementsByTagName('a')[0].href

              var profileUrl = item.children[1].getElementsByClassName('header byline clearfix')[0].getElementsByClassName('inline-profile ')[0].getElementsByTagName('a')[0].href
              var profileSn = item.children[1].getElementsByClassName('header byline clearfix')[0].getElementsByClassName('inline-profile ')[0].getElementsByClassName('username')[0].textContent
              var server = item.children[1].getElementsByClassName('header byline clearfix')[0].getElementsByClassName('inline-profile ')[0].getElementsByClassName('realm')[0].textContent
              var timeago = item.children[1].getElementsByClassName('header byline clearfix')[0].getElementsByClassName('timeago')[0].title
              var url = item.children[1].getElementsByClassName('footer')[0].getElementsByClassName('right')[0].getElementsByTagName('a')[0].href

              var isRioter = (typeof item.children[1].getElementsByClassName('header byline clearfix')[0].getElementsByClassName('inline-profile isRioter')[0] !== 'undefined' && true || false)
              var whole = item.children[1].getElementsByClassName('body markdown-content')[0]

              if (!whole) { // message deleted
                whole = 'Content deleted'
              } else {
                whole = whole.textContent
              }

              var message = (whole.split(parentComment)[1] || whole).trim()

              exists[`${discussion}:${comment}`] = true
              if (!notifications[discussion + ':' + comment]) {
                notifications[`${discussion}:${comment}`] = [board, discussion, comment, parentDiscussion, parentDiscussionUrl, profileUrl, profileSn, server, timeago, url, message, isRioter, i]

                if (notification === true && options['enableNotifications']) {
                  submitNotification(message, url, profileSn, isRioter)
                }
              }
            }

            for (key in notifications) {
              n = exists[key]
              if (!n) {
                notifications[key] = undefined
                exists[key] = undefined
              }
            }

            notifications.sort(compare)
            notification = true
            exists = []
          } else {
            updateBadge('LOGIN', true)
          }
        }
      }
    }
    xhr.ontimeout = function () {
      if (xhr.status === 302 || xhr.status === 0) {
        return
      }
      updateBadge('ERR', true)
    }
    if (!navigator.onLine) {
      xhr.ontimeout()
    } else {
      xhr.send()
    }
    chrome.cookies.get({
      url: `https://boards.${getRegion()}.leagueoflegends.com`,
      name: 'APOLLO_TOKEN'
    },
    function (ck) {
      if (ck) {
        cookie = ck.value
      }
    }
    )
    updateTimer()
  }

  var updateTimer = function () {
    setTimeout(updateNotifications, options['updateDelay'] * 1000)
  }

  var updateBadge = function (text, error) {
    if (error) {
      chrome.browserAction.setBadgeBackgroundColor({
        color: [255, 20, 20, 255]
      })
    } else {
      if (text === '0') {
        chrome.browserAction.setBadgeBackgroundColor({
          color: [20, 20, 255, 255]
        })
      } else {
        chrome.browserAction.setBadgeBackgroundColor({
          color: [0, 150, 0, 255]
        })
      }
    }
    chrome.browserAction.setBadgeText({
      text: text
    })
  }

  var submitNotification = function (message, url, _from, isRioter) {
    message = (message.length > 128 && message.substring(0, 128 - 3) + '...' || message)
    title = chrome.i18n.getMessage('main_newnotif') + ' ' + _from
    var options = {
      title: title,
      message: message,
      contextMessage: 'Read more...',
      type: 'basic',
      iconUrl: 'images/icon48.png',
      isClickable: true,
      requireInteraction: (isRioter || false)
    }
    chrome.notifications.create('Boardfications_' + url, options)
  }

  var getOptions = function () {
    chrome.storage.sync.get({
      updateDelay: 10,
      enableNotifications: true,
      region: 'las'
    }, function (items) {
      options['updateDelay'] = items.updateDelay
      options['enableNotifications'] = items.enableNotifications
      options['region'] = items.region
    })
  }

  chrome.notifications.onClicked.addListener(function (id) {
    if (id.search('Boardfications_') != -1) {
      chrome.notifications.clear(id)
      var url = id.replace('Boardfications_', '')
      var options = {
        url: url,
        active: true
      }
      chrome.tabs.create(options)
    }
  })

  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
      var options = {
        url: 'documents/options/options.html',
        active: true
      }
      chrome.tabs.create(options)
    }
  })

  setAsRead = function (comments) {
    comments['apolloToken'] = cookie
    var xhr = new XMLHttpRequest()
    xhr.open('PUT', `https://boards.${getRegion()}.leagueoflegends.com/api/myupdates`)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    xhr.onload = function () {
      if (xhr.status === 200) {
        updateNotifications()
      }
    }
    xhr.send(serialize(comments))
  }

  serialize = function (obj) {
    var str = []
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    }
    return str.join('&')
  }

  getRegion = function () {
    return options['region'] || 'las'
  }

  reloadExtension = function () {
    chrome.runtime.reload()
  }

  compare = function (a, b) {
    if (a[12] > b[12]) {
      return 1
    }
    if (a[12] < b[12]) {
      return -1
    }
    return 0
  }

  getChampionsId = function () {
    var version = gameVersions['champion'] || '7.24.1'
    var xhr = new XMLHttpRequest()
    xhr.open('GET', `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resp = JSON.parse(xhr.responseText)
          for (var champions in resp['data']) {
            var championName = resp['data'][champions]['id']
            var championId = resp['data'][champions]['key']
            championNameById[parseInt(championId)] = championName
          }
        }
      }
    }
    xhr.send()
  }

  getSummonerSpells = function () {
    var version = gameVersions['summoner'] || '7.24.1'
    var xhr = new XMLHttpRequest()
    xhr.open('GET', `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resp = JSON.parse(xhr.responseText)
          for (var spells in resp['data']) {
            var spellName = resp['data'][spells]['id']
            var spellId = resp['data'][spells]['key']
            summonerSpellById[parseInt(spellId)] = spellName
          }
        }
      }
    }
    xhr.send()
  }

  getGameVersion = function () {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', `https://ddragon.leagueoflegends.com/realms/na.json`, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resp = JSON.parse(xhr.responseText)
          for (var n in resp['n']) {
            gameVersions[n] = resp['n'][n]
          }
          getChampionsId()
          getSummonerSpells()
        }
      }
    }
    xhr.send()
  }
  getGameVersion()

  updateBadge('...', true)
  getOptions()
  updateNotifications()
})
