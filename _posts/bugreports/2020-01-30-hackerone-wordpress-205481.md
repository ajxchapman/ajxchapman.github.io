---
layout: post
title: WordPress - Wordpress unzip_file path traversal
category: bugreports
redirect_to: https://hackerone.com/reports/205481
---

**HackerOne bug report to WordPress:** The Wordpress unzip_file function (https://codex.wordpress.org/Function_Reference/unzip_file) is vulnerable to path traversal when extracting zip files. Extracting untrusted zip files using this function this could lead to code execution through placing arbitrary PHP files in the DocumentRoot of the webserver.
