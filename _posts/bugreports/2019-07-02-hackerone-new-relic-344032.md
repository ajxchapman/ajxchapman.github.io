---
layout: post
title: New Relic - Blind SSRF in Ticketing Integrations Jira webhooks leading to internal network enumeration and blind HTTP requests
category: bugreports
redirect_to: https://hackerone.com/reports/344032
---

**HackerOne bug report to New Relic:** The Ticketing Integrations Jira webhooks for Jira 5/6 and Jira 4 are vulnerable to Blind SSRF issues. These endpoints can be abused to map internal NewRelic network services and send blind HTTP GET and POST requests to identified services.
