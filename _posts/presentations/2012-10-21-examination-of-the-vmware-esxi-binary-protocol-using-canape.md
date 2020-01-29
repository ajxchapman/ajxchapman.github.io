---
layout: post
title: Ruxcon 2012 - Examination of the VMware ESXi Binary Protocol Using CANAPE
category: presentations
---

This presentation will cover a demonstration of the new version of the Canape protocol analysis tool being released for Ruxcon. During the course of the presentation various attack scenarios against the VMWare ESXi binary protocol will be demonstrated using Canape.

<!--more-->

The VMWare ESXi protocol is a complex multi-layered protocol which transitions between many protocol states throughout a connection lifetime. The protocol uses multiplexed frames, compression and encryption all over a single TCP connection. The talk will discuss and outline serious weaknesses within the ESXi protocol and how these can be leveraged from within Canape.

During the talk, new features of Canape will be demonstrated live to show the audience how the tool can be used from traffic interception and initial protocol dissection through data injection and fuzzing and finally demonstrating full PoC exploitation all within Canape.

Presentation outline:
* What is Canape
* Examining the VMWare ESXi protocol
* Demonstrating ESXi protocol interception
* Intercepting the ESXi encryption
* Data injection to brute force user credentials
* Fuzzing ESXi
* 0day demonstration

## Canape

Testing and exploiting binary network protocols can be both complex and time consuming. More often than not, custom software needs to be developed to proxy, parse and manipulate the target traffic.

Canape is a network protocol analysis tool which takes the existing paradigm of Web Application testing tools (such as CAT, Burp or Fiddler) and applies that to network protocol testing. Canape provides a user interface that facilitates the capture and replaying of binary network traffic, whilst providing a framework to develop parsers and fuzzers.

Rather than creating a complete bespoke program to proxy and manipulate protocol traffic, Canape can be used to provide the networking, parsing and fuzzing infrastructure to significantly reduce assessment effort.

## Recording
<iframe width="832" height="468" src="https://www.youtube.com/embed/rR7jdzl_NNc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Slides
<script async class="speakerdeck-embed" data-id="93783ca26a8846bfa19801e209126f5a" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

[**Download Slides**](https://drive.google.com/open?id=1csR7JaRBo9CvlYZvnRG_yo5Zwfwa3n3N)
