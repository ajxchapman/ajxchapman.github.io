---
layout: post
title: GitLab - Importing GitLab project archives can replace uploads of other users
category: bugreports
featured: true
redirect_to: https://hackerone.com/reports/534794
---

**HackerOne bug report to GitLab:** Importing a modified exported GitLab project archive can overwrite uploads for other users. If the `secret` and `file name` of an upload are known (these can be easily identified for any uploads to public repositories), any user can import a new project which overwrites the served content of the upload with arbitrary content.
