---
layout: post
title: Black Hat 2015 - WSUSpect - Compromising the Windows Enterprise via Windows Update
category: presentations
---

Ever wondered what really happens when you plug in a USB device and Windows begins 'searching for Drivers'? Who doesn't have that Windows Update reboot dialog sitting in the corner of their desktop? Our talk will take an exciting look at one of the dullest corners of the Windows OS.

WSUS (Windows Server Update Services) allows admins to co-ordinate software updates to servers and desktops throughout their organisation. Whilst all updates must be signed by Microsoft, we find other routes to deliver malicious updates to Windows systems using WSUS. We will demonstrate how a default WSUS deployment can be leveraged to gain SYSTEM level access to machines on the local network.

<!--more-->

We also take a look at exactly what happens when you plug in a new USB device into a Windows desktop. There are thousands Microsoft-signed updates for 3rd party drivers available through Windows Update. We show how driver installs can be triggered by low privileged users and look at the insecurities that can be introduced by these Microsoft-blessed drivers.

In addition to some exciting demos we will also describe how to lock down enterprise WSUS configurations to avoid these "on by default" vulnerabilities.

You have 1 malicious update ready to install...

## Recording
<iframe width="832" height="468" src="https://www.youtube.com/embed/mU8vw4gRaGs" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Slides
<script async class="speakerdeck-embed" data-id="12246f6d001d4e4c9f8a7c40581bc320" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

[**Download Slides**](https://drive.google.com/open?id=1JZc4LAzS0DfCkGVhloLPe5AUigxka_ms)

[**Download White Paper**](https://drive.google.com/open?id=14XFaewaPh4SzI-gSdiP6HrOrA_RIHdPM)
