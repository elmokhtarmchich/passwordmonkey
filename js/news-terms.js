
// news-terms.js - highlight glossary terms and company names on news pages (vanilla ES5, IIFE)
(function () {
  'use strict';

  var MAX_PER_TERM = 3;
  var MAX_TOTAL = 40;
  var CASE_SENSITIVE = {};
  CASE_SENSITIVE.CVE = 1;
  CASE_SENSITIVE.APT = 1;
  CASE_SENSITIVE.MFA = 1;
  CASE_SENSITIVE['2FA'] = 1;
  CASE_SENSITIVE.C2 = 1;
  CASE_SENSITIVE.RAT = 1;
  CASE_SENSITIVE.DDoS = 1;
  var GLOSSARY = [
    ['ransomware', [], 'Malware that encrypts or steals data and demands payment to restore access.'],
    ['phishing', [], 'Fraudulent messages that trick people into revealing credentials or running malware.'],
    ['malware', [], 'Any software intentionally built to cause damage or gain unauthorized access.'],
    ['zero-day', ['zero day'], 'A security flaw unknown to the vendor, exploitable before any patch exists.'],
    ['botnet', [], 'A network of hijacked devices controlled remotely by an attacker.'],
    ['infostealer', ['info stealer'], 'Malware built to harvest credentials and sensitive data from infected devices.'],
    ['keylogger', [], 'Malware that records every keystroke to capture passwords and messages.'],
    ['spyware', [], 'Malware that secretly monitors activity and exfiltrates data.'],
    ['rootkit', [], 'Stealthy malware that gives attackers privileged control while hiding itself.'],
    ['backdoor', [], 'A hidden route to bypass authentication and regain access to a system.'],
    ['exploit', [], 'Code or a technique that takes advantage of a vulnerability.'],
    ['vulnerability', [], 'A weakness in software or configuration that attackers can abuse.'],
    ['initial access', [], 'The first foothold an attacker establishes in a victim network.'],
    ['data breach', ['data-breach'], 'Unauthorized access to, or exposure of, sensitive data.'],
    ['social engineering', [], 'Manipulating people rather than code to gain access or information.'],
    ['credential stuffing', [], 'Testing stolen username and password pairs against login pages at scale.'],
    ['brute force', ['brute-force', 'bruteforce'], 'Systematically guessing passwords until one works.'],
    ['password manager', [], 'An app that generates and stores strong, unique passwords for you.'],
    ['passkey', [], 'A phishing-resistant passwordless login credential tied to your device.'],
    ['two-factor authentication', ['multi-factor authentication', 'MFA', '2FA'], 'Login that requires a second proof of identity beyond the password.'],
    ['command and control', ['command-and-control', 'C2'], 'The channel attackers use to send instructions to compromised systems.'],
    ['remote access trojan', ['remote-access trojan', 'RAT'], 'Malware that lets attackers control an infected device from afar.'],
    ['supply chain attack', ['supply-chain attack'], 'Compromising a trusted vendor or update to reach its downstream users.'],
    ['denial of service', ['denial-of-service', 'DDoS'], 'Flooding a service with traffic to make it unavailable.'],
    ['SQL injection', [], 'Injecting database commands through unsanitized input fields.'],
    ['end-to-end encryption', [], 'Encryption only the sender and the intended receiver can undo.'],
    ['wiper', [], 'Destructive malware that erases data instead of holding it for ransom.'],
    ['CVE', [], 'The public catalog ID assigned to a disclosed security vulnerability.'],
    ['APT', [], 'Advanced persistent threat: a well-resourced group running long, targeted intrusions.']
  ];
  var COMPANIES = [
    ['Microsoft', 'MSFT'],
    ['Google', 'GOOGL'],
    ['Alphabet', 'GOOGL'],
    ['Apple', 'AAPL'],
    ['Amazon', 'AMZN'],
    ['Meta', 'META'],
    ['Oracle', 'ORCL'],
    ['Cisco', 'CSCO'],
    ['IBM', 'IBM'],
    ['Intel', 'INTC'],
    ['NVIDIA', 'NVDA'],
    ['Salesforce', 'CRM'],
    ['Adobe', 'ADBE'],
    ['PayPal', 'PYPL'],
    ['Cloudflare', 'NET'],
    ['CrowdStrike', 'CRWD'],
    ['Okta', 'OKTA'],
    ['Zscaler', 'ZS'],
    ['Palo Alto Networks', 'PANW'],
    ['Fortinet', 'FTNT'],
    ['Citrix', 'CTXS'],
    ['Dell', 'DELL'],
    ['Spotify', 'SPOT'],
    ['Sony', 'SONY']
  ];

  function escapeRe(str) {
    return String(str).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\\$&');
  }

  function wikiUrl(canonical) {
    return 'https://en.wiktionary.org/wiki/' + String(canonical).replace(/\s+/g, '_');
  }

  function financeUrl(ticker) {
    return 'https://finance.yahoo.com/quote/' + String(ticker);
  }

  function collectPatterns() {
    var patterns = [];
    var g = 0;
    for (g = 0; g < GLOSSARY.length; g++) {
      var row = GLOSSARY[g];
      var canonical = row[0];
      var extras = row[1] || [];
      var def = row[2];
      patterns.push({
        text: canonical,
        key: canonical,
        kind: 'term',
        def: def,
        href: wikiUrl(canonical)
      });
      var e = 0;
      for (e = 0; e < extras.length; e++) {
        patterns.push({
          text: extras[e],
          key: canonical,
          kind: 'term',
          def: def,
          href: wikiUrl(canonical)
        });
      }
    }
    var c = 0;
    for (c = 0; c < COMPANIES.length; c++) {
      var crow = COMPANIES[c];
      var cname = crow[0];
      var cticker = crow[1];
      patterns.push({
        text: cname,
        key: cname,
        kind: 'co',
        def: 'View ' + cticker + ' on Yahoo Finance',
        href: financeUrl(cticker)
      });
    }
    patterns.sort(function (a, b) {
      var la = a.text.length;
      var lb = b.text.length;
      if (lb !== la) {
        return lb - la;
      }
      return 0;
    });
    return patterns;
  }

  function buildRegex(patterns, sensitiveWanted) {
    var parts = [];
    var i = 0;
    for (i = 0; i < patterns.length; i++) {
      var p = patterns[i];
      var s = p.text;
      var isSensitive = p.kind === 'co' || !!(CASE_SENSITIVE[s]);
      if (sensitiveWanted) {
        if (isSensitive) {
          parts.push(escapeRe(s));
        }
      } else {
        if (!isSensitive) {
          parts.push(escapeRe(s));
        }
      }
    }
    if (parts.length === 0) {
      return null;
    }
    var flags = sensitiveWanted ? 'g' : 'gi';
    return new RegExp('\\b(?:' + parts.join('|') + ')\\b', flags);
  }
  function collectTextNodes(root) {
    var result = [];
    if (!root) {
      return result;
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      var node = walker.currentNode;
      var parent = node.parentElement;
      if (!parent) {
        continue;
      }
      var tag = parent.tagName;
      if (tag === 'A' || tag === 'BUTTON' || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4' || tag === 'H5' || tag === 'H6' || tag === 'TEXTAREA' || tag === 'TITLE') {
        continue;
      }
      if (parent.className && (String(parent.className).indexOf('pm-term') !== -1 || String(parent.className).indexOf('pm-co') !== -1)) {
        continue;
      }
      if (String(node.data || '').trim().length < 3) {
        continue;
      }
      result.push(node);
    }
    return result;
  }

  function main() {
    var body = document.querySelector('.prose.prose-lg');
    if (!body) {
      return;
    }
    if (body.getAttribute('data-pm-terms') === '1') {
      return;
    }
    body.setAttribute('data-pm-terms', '1');
    var patterns = collectPatterns();
    var mapSensitive = {};
    var mapInsensitive = {};
    var i = 0;
    for (i = 0; i < patterns.length; i++) {
      var p = patterns[i];
      var keyS = escapeRe(p.text);
      mapSensitive[keyS] = p;
      mapInsensitive[keyS.toLowerCase()] = p;
    }
    var reInsensitive = buildRegex(patterns, false);
    var reSensitive = buildRegex(patterns, true);
    var counts = {};
    var total = 0;
    var textNodes = collectTextNodes(body);
    var t = 0;
    for (t = 0; t < textNodes.length; t++) {
      var node = textNodes[t];
      var rawText = node.data;
      var matches = [];
      if (reInsensitive) {
        var m1;
        while ((m1 = reInsensitive.exec(rawText)) !== null) {
          matches.push({ start: m1.index, end: m1.index + m1[0].length, raw: m1[0] });
        }
      }
      if (reSensitive) {
        var m2;
        while ((m2 = reSensitive.exec(rawText)) !== null) {
          matches.push({ start: m2.index, end: m2.index + m2[0].length, raw: m2[0] });
        }
      }
      if (matches.length === 0) {
        continue;
      }
      matches.sort(function (a, b) {
        if (a.start !== b.start) {
          return a.start - b.start;
        }
        var lenA = a.end - a.start;
        var lenB = b.end - b.start;
        if (lenB !== lenA) {
          return lenB - lenA;
        }
        return 0;
      });
      var chosen = [];
      var lastEnd = -1;
      var mm = 0;
      for (mm = 0; mm < matches.length; mm++) {
        var ms = matches[mm];
        if (ms.start < lastEnd) {
          continue;
        }
        var rawm = ms.raw;
        var keyEsc = escapeRe(rawm);
        var pat = mapSensitive[keyEsc];
        if (!pat) {
          pat = mapInsensitive[keyEsc.toLowerCase()];
        }
        if (!pat) {
          lastEnd = ms.end;
          continue;
        }
        var ckey = pat.key;
        var ccount = counts[ckey];
        if (typeof ccount === "undefined") {
          ccount = 0;
        }
        if (ccount >= MAX_PER_TERM) {
          continue;
        }
        if (total >= MAX_TOTAL) {
          break;
        }
        chosen.push({ start: ms.start, end: ms.end, raw: rawm, pat: pat });
        counts[ckey] = ccount + 1;
        total++;
        lastEnd = ms.end;
      }
      if (chosen.length === 0) {
        continue;
      }
      var frag = document.createDocumentFragment();
      var pos = 0;
      var ch = 0;
      for (ch = 0; ch < chosen.length; ch++) {
        var sel = chosen[ch];
        if (sel.start > pos) {
          frag.appendChild(document.createTextNode(rawText.slice(pos, sel.start)));
        }
        var a = document.createElement('a');
        a.className = (sel.pat.kind === 'co') ? 'pm-co' : 'pm-term';
        a.href = sel.pat.href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('data-def', sel.pat.def);
        a.tabIndex = 0;
        a.textContent = sel.raw;
        frag.appendChild(a);
        pos = sel.end;
      }
      if (pos < rawText.length) {
        frag.appendChild(document.createTextNode(rawText.slice(pos)));
      }
      node.parentNode.replaceChild(frag, node);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
