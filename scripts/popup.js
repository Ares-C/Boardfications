/*
  Author: AresC
  Project: Boardfications
  Repository: https://github.com/Ares-C/Boardfications
*/
var championNameById = chrome.extension.getBackgroundPage().championNameById // needs to be before textile
var summonerSpellById = chrome.extension.getBackgroundPage().summonerSpellById // needs to be before textile

var gameVersions = chrome.extension.getBackgroundPage().gameVersions // needs to be before textile

/***************************************
 *  Javascript Textile->HTML conversion
 *  ben@ben-daglish.net (with thanks to John Hughes for improvements)
 *   Issued under the "do what you like with it - I take no respnsibility" licence
 ****************************************/
function convert (e) {
  var t = e.split(/\r?\n/)
  html = '', inpr = inbq = inbqq = 0
  for (var a = 0; a < t.length; a++) {
    if (t[a].indexOf('[') === 0) {
      var l = t[a].indexOf(']')
      aliases[t[a].substring(1, l)] = t[a].substring(l + 1)
    }
  } for (a = 0; a < t.length; a++) {
    if (t[a].indexOf('[') !== 0) {
      if (mm = para.exec(t[a])) stp(1), inpr = 1, html += t[a].replace(para, '<p' + make_attr(mm[1]) + '>' + prep(mm[2]))
      else if (mm = /^h(\d)(\S*)\.\s*(.*)/.exec(t[a])) stp(1), html += tag('h' + mm[1], make_attr(mm[2]), prep(mm[3])) + le
      else if (mm = rfn.exec(t[a])) stp(1), inpr = 1, html += t[a].replace(rfn, '<p id="fn' + mm[1] + '"><sup>' + mm[1] + '</sup>' + prep(mm[2]))
      else {
        if (t[a].indexOf('*') === 0) lst = '<ul>', elst = '</ul>'
        else if (t[a].indexOf('#') === 0) lst = '<ol>', elst = '</ol>'
        else {
          for (; lstlev > 0;) html += elst, html += lstlev > 1 ? '</li>' : '\n', html += '\n', lstlev--
          lst = ''
        }
        if (lst) {
          stp(1)
          for (var n = (l = /^([*#]+)\s*(.*)/.exec(t[a]))[1].length; n < lstlev;) html += elst + '</li>\n', lstlev--
          for (; lstlev < n;) html = html.replace(/<\/li>\n$/, '\n'), html += lst, lstlev++
          html += tag('li', '', prep(l[2])) + '\n'
        } else if (t[a].match(table)) stp(1), intable = 1, html += t[a].replace(table, '<table style="$1;">\n')
        else if (t[a].indexOf('|') === 0 || t[a].match(trstyle)) {
          stp(1), intable || (html += '<table>\n', intable = 1)
          var r = ''
          var s = ''
          var i = trstyle.exec(t[a])
          i && (r = qat('style', i[1]), t[a] = t[a].replace(trstyle, '|'))
          var p = t[a].split('|')
          for (j = 1; j < p.length - 1; j++) {
            var m = 'td'
            p[j].indexOf('_.') === 0 && (m = 'th', p[j] = p[j].substring(2)), p[j] = prep(p[j])
            var c = /^([<>=^~\/\\\{]+.*?)\.(.*)/.exec(p[j])
            var g = ''
            var o = ''
            if (c != null) {
              p[j] = c[2]
              var u = /\\(\d+)/.exec(c[1])
              u != null && (g += qat('colspan', u[1]))
              var f = /\/(\d+)/.exec(c[1])
              f != null && (g += qat('rowspan', f[1]))
              var h = /([\^~])/.exec(c[1])
              h != null && (o += 'vertical-align:' + alg[h[1]] + ';')
              var d = /(<>|=|<|>)/.exec(c[1])
              d != null && (o += 'text-align:' + alg[d[1]] + ';')
              var b = /\{([^\}]+)\}/.exec(c[1])
              b != null && (o += b[1]), o != '' && (g += qat('style', o))
            }
            s += tag(m, g, p[j])
          }
          html += '\t' + tag('tr', r, s) + '\n'
        } else intable && (html += '</table>' + le, intable = 0), t[a] === '' ? stp() : inpr ? html += prep(t[a]) : ((mm = bq.exec(t[a])) && (t[a] = t[a].replace(bq, ''), html += '<blockquote>', inbq = 1, mm[1] && (inbqq = 1)), html += '<p>' + prep(t[a]), inpr = 1)
      }
    }
  }
  return stp(), html
}

function prep (e) {
  e = e.replace(/>.*?(?<=>).*/g, '')
  for (i in ent) e = e.replace(new RegExp(i, 'g'), ent[i])
  for (i in tags) e = make_tag(e = make_tag(e, RegExp('^' + tags[i] + '(.+?)' + tags[i]), i, ''), RegExp(' ' + tags[i] + '(.+?)' + tags[i]), i, ' ')
  return e = e.replace(/\[(\d+)\]/g, '<sup><a href="#fn$1">$1</a></sup>'), e = e.replace(/([A-Z]+)\((.*?)\)/g, '<acronym title="$2">$1</acronym>'), e = e.replace(/\"([^\"]+)\":((http|https|mailto):\S+)/g, '<a href="$2">$1</a>'), e = make_image(e, /!([^!\s]+)!:(\S+)/), e = make_image(e, /!([^!\s]+)!/), e = e.replace(/{{sticker:(.*?)}}/g, function (e, t) {
    return t.search('sg-') != -1 ? endpoint = 'starguardian' : endpoint = 'slayer140', '<span class="sticker slayer" style="background-image: url(https://cdn.leagueoflegends.com/stickers/' + endpoint + '/' + t + '.png); background-size: contain;"></span>'
  }), e = e.replace(/{{item:(.*?)}}/g, '<span class="item" style="background: url(http://ddragon.leagueoflegends.com/cdn/' + gameVersions.item + '/img/item/$1.png); background-size: contain"></span>'), e = e.replace(/{{champion:(.*?)}}/g, function (e, t) {
    return '<span class="item" style="background: url(http://ddragon.leagueoflegends.com/cdn/' + gameVersions.sticker + '/img/champion/' + championNameById[parseInt(t)] + '.png); background-size: contain"></span>'
  }), e = e.replace(/{{summoner:(.*?)}}/g, function (e, t) {
    return '<span class="item" style="background: url(http://ddragon.leagueoflegends.com/cdn/' + gameVersions.summoner + '/img/spell/' + summonerSpellById[parseInt(t)] + '.png); background-size: contain"></span>'
  }), e = e.replace(/"([^\"]+)":(\S+)/g, function (e, t, a) {
    return tag('a', qat('href', aliases[a]), t)
  }), e = e.replace(/(=)?"([^\"]+)"/g, function (e, t, a) {
    return t ? e : '&#8220;' + a + '&#8221;'
  })
}

function make_tag (e, t, a, l) {
  for (; m = t.exec(e);) {
    var n = make_attr(m[1])
    m[1] = m[1].replace(/^[\[\{\(]\S+[\]\}\)]/g, ''), m[1] = m[1].replace(/^[<>=()]+/, ''), e = e.replace(t, l + tag(a, n, m[1]))
  }
  return e
}

function make_image (e, t) {
  var a = t.exec(e)
  if (a != null) {
    var l = ''
    var n = ''
    var r = /\((.*)\)$/.exec(a[1])
    r != null && (l = qat('alt', r[1]) + qat('title', r[1]), a[1] = a[1].replace(/\((.*)\)$/, '')), a[1].match(/^[><]/) && (n = 'float:' + (a[1].indexOf('>') === 0 ? 'right;' : 'left;'), a[1] = a[1].replace(/^[><]/, ''))
    var s = /(\(+)/.exec(a[1])
    s && (n += 'padding-left:' + s[1].length + 'em;')
    var i = /(\)+)/.exec(a[1])
    i && (n += 'padding-right:' + i[1].length + 'em;'), n && (l += qat('style', n))
    var p = '<img src="' + a[1] + '"' + l + ' />'
    a.length > 2 && (p = tag('a', qat('href', a[2]), p)), e = e.replace(t, p)
  }
  return e
}

function make_attr (e) {
  var t = ''
  var a = ''
  if (!e) return ''
  var l = /\[(\w\w)\]/.exec(e)
  l != null && (a += qat('lang', l[1]))
  var n = /\((\S+)\)/.exec(e)
  n != null && (e = e.replace(/\((\S+)\)/, ''), a += n[1].replace(/#(.*)$/, ' id="$1"').replace(/^(\S+)/, ' class="$1"'))
  var r = /(<>|=|<|>)/.exec(e)
  r && (t += 'text-align:' + alg[r[1]] + ';')
  var s = /\{(\S+)\}/.exec(e)
  s && (t += s[1], s[1].match(/;$/) || (t += ';'))
  var i = /(\(+)/.exec(e)
  i && (t += 'padding-left:' + i[1].length + 'em;')
  var p = /(\)+)/.exec(e)
  return p && (t += 'padding-right:' + p[1].length + 'em;'), t && (a += qat('style', t)), a
}

function qat (e, t) {
  return ' ' + e + '="' + t + '"'
}

function tag (e, t, a) {
  return '<' + e + t + '>' + a + '</' + e + '>'
}

function stp (e) {
  e && (inbqq = 0), inpr && (html += '</p>' + le, inpr = 0), inbq && !inbqq && (html += '</blockquote>' + le, inbq = 0)
}
var inpr
var inbq
var inbqq
var html
var aliases = []
var alg = {
  '>': 'right',
  '<': 'left',
  '=': 'center',
  '<>': 'justify',
  '~': 'bottom',
  '^': 'top'
}
var ent = {
  "'": '&#8217;',
  ' - ': ' &#8211; ',
  '--': '&#8212;',
  ' x ': ' &#215; ',
  '\\.\\.\\.': '&#8230;',
  '\\(C\\)': '&#169;',
  '\\(R\\)': '&#174;',
  '\\(TM\\)': '&#8482;'
}
var tags = {
  b: '\\*\\*',
  i: '__',
  em: '_',
  strong: '\\*',
  cite: '\\?\\?',
  sup: '\\^',
  sub: '~',
  span: '\\%',
  code: '@',
  ins: '\\+',
  del: '-'
}
var le = '\n\n'
var lstlev = 0
var lst = ''
var elst = ''
var intable = 0
var mm = ''
var para = /^p(\S*)\.\s*(.*)/
var rfn = /^fn(\d+)\.\s*(.*)/
var bq = /^bq\.(\.)?\s*/
var table = /^table\s*{(.*)}\..*/
var trstyle = /^\{(\S+)\}\.\s*\|/

var linkTag = document.createElement('link')
linkTag.href = '/stylesheets/boards.css'
linkTag.rel = 'stylesheet'
document.getElementsByTagName('head')[0].appendChild(linkTag)

setTimeout(function () {
  applyLocalizationToPopup()
  document.body.style = 'visibility:visible'
}, 50)

var notifications = chrome.extension.getBackgroundPage().notifications
var champions = chrome.extension.getBackgroundPage().champions
var getRegion = function () {
  return chrome.extension.getBackgroundPage().getRegion()
}

if (Object.keys(notifications).length > 0) {
  var source = ''
  for (key in notifications) {
    var item = notifications[key]

    if (item) {
      var board = item[0]
      var discussion = item[1]
      var comment = item[2]
      var parentDiscussion = item[3]
      var parentDiscussionUrl = item[4]
      var profileUrl = item[5]
      var profileSn = item[6]
      var server = item[7]
      var timeago = item[8]
      var url = item[9]
      var message = convert(item[10])
      var isRioter = item[11]

      var avatar = isRioter ? `/images/riot_fist.png` : `https://avatar.leagueoflegends.com/${getRegion()}/${encodeURIComponent(profileSn)}.png`
      var fontColor = isRioter ? `<font color=#ae250f> ${profileSn} </font>` : profileSn
      var goToComment = chrome.i18n.getMessage('main_gtc')
      var _in = chrome.i18n.getMessage('main_in')

      source = source +
        `<div class='update-item' data-application-id=${board} data-discussion-id=${discussion} data-comment-id=${comment}>
        <div class='parent-comment'> 
          <span>${_in}</span> 
          <a href=${parentDiscussionUrl} target='_blank'>${parentDiscussion}</a> 
        </div>
        <div class='comment clearfix'> 
          <div class='header byline clearfix'> 
            <div class='inline-profile'>
              <a href=${profileUrl} target='_blank'>
                <span class='icon'>
                  <img src=${avatar}>
                </span>
                <span class='username'>
                  ${fontColor}
                </span>
              </a>
              <span class='realm'>
                ${server}
              </span>
            </div>
            <span class='timeago' title=${timeago}> </span> 
          </div>
          <div class='body markdown-content'>
            ${message}
          </div> 
          <div class='footer'>
            <div class='right'>
              <a href=${url} target='_blank'>${goToComment}</a>
            </div> 
          </div> 
        </div> 
      </div>`
      document.getElementById('my-updates').innerHTML = source
    }
  }
}

document.getElementById('settings').onclick = function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    window.open(chrome.runtime.getURL('options.html'))
  }
}

document.getElementById('clear').onclick = function () {
  var a = document.getElementsByClassName('update-item')
  var comments = {}

  comments['readState'] = 'true'

  for (var i = 0; i < a.length; i++) {
    var item = a[i]
    var board = item.getAttribute('data-application-id')
    var discussion = item.getAttribute('data-discussion-id')
    var comment = item.getAttribute('data-comment-id')

    comments[`comments[${board}][${discussion}][]` + ' '.repeat(i + 1)] = comment
  }
  chrome.extension.getBackgroundPage().setAsRead(comments)
  window.close()
}

document.getElementById('about').onclick = function () {
  var disclaimer = document.getElementById('disclaimer')
  if (disclaimer.style['display'] === 'none' || !disclaimer.style['display']) {
    disclaimer.style = 'display: inline-block'
    window.scrollTo(0, window.innerHeight)
  } else {
    disclaimer.style = 'display: none'
  }
}

function applyLocalizationToPopup () {
  var objects = document.getElementsByTagName('*')

  for (var i = 0, max = objects.length; i < max; i++) {
    var object = objects[i]
    if (object && object.getAttribute('data-i18n') === 'true') {
      var message = chrome.i18n.getMessage(object.innerHTML.trim())
      object.innerText = message
    }
  }
}
