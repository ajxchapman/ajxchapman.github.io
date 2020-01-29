---
layout: post
title: GitLab - GitLab::UrlBlocker validation bypass leading to full Server Side Request Forgery
category: bugreports
redirect_to: https://hackerone.com/reports/541169
---

**HackerOne bug report to GitLab:** The `GitLab::UrlBlocker` IP address validation methods suffer from a Time of Check to Time of Use (ToCToU) vulnerability. The vulnerability occurs due to multiple DNS resolution requests performed before and after the checks. This issue allows a malicious authenticated user to send GET and POST HTTP requests to arbitrary hosts, including the localhost, cloud metadata services and the local network, and read the HTTP response.
