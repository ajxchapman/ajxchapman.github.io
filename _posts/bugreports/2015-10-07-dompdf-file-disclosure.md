---
layout: post
title: dompdf - Local File Disclosure
category: bugreports
---

Dompdf is vulnerable to a file disclosure vulnerability which can be exploited by anonymous, unauthenticated attackers to download arbitrary files from the underlying hosting server. Exploitation of this issue requires a non-standard configuration option to be set, specifically the DOMPDF_ENABLE_REMOTE option must be set to true.

<!--more-->

*Patch resulting from this bug report be viewed at [https://github.com/dompdf/dompdf/commit/b09e8e9eb8c0007d61b4123783a62f34673c5237](https://github.com/dompdf/dompdf/commit/b09e8e9eb8c0007d61b4123783a62f34673c5237)*

<pre class="bugreport">
Description:        Dompdf Local File Disclosure
Versions Affected:  Dompdf 0.6.1
URL:	            http://dompdf.github.io
Category:           File Disclosure
Credit:             Alex Chapman of Context Information Security

Summary:
--------
Dompdf is vulnerable to a file disclosure vulnerability which can be exploited by anonymous, unauthenticated attackers to download arbitrary files from the underlying hosting server. Exploitation of this issue requires a non-standard configuration option to be set, specifically the DOMPDF_ENABLE_REMOTE option must be set to true. It should be noted that this configuration has been observed during an assessment of a popular 3rd party application which uses the dompdf library.

Analysis:
---------
The function load_html_file in include/dompdf.cls.php takes a file path as an argument, under certain circumstances (such as when invoked from dompdf.php) this filepath can be entirely user controlled. The function attempts to check if the supplied file is a local file path, line 481 below, and performs some security checking on the local path to ensure sensitive local files are not disclosed, lines 482-500. However, the check for the local "file://" URI is performed case sentitive, and can thus be bypassed with an all uppercase local URI of "FILE://". This will fail the if statement on line 481, bypassing the security checks on lines 482-500, and be passed to file_get_contents on line 502, which treats both "file://" and "FILE://" alike.

467 function load_html_file($file) {
468   $this-&gt;save_locale();
469
470   // Store parsing warnings as messages (this is to prevent output to the
471   // browser if the html is ugly and the dom extension complains,
472   // preventing the pdf from being streamed.)
473   if ( !$this-&gt;_protocol && !$this-&gt;_base_host && !$this-&gt;_base_path ) {
474     list($this-&gt;_protocol, $this-&gt;_base_host, $this-&gt;_base_path) = explode_url($file);
475   }
476
477   if ( !$this-&gt;get_option("enable_remote") && ($this-&gt;_protocol != "" && $this-&gt;_protocol !== "file://" ) ) {
478     throw new DOMPDF_Exception("Remote file requested, but DOMPDF_ENABLE_REMOTE is false.");
479   }
480
481   if ($this-&gt;_protocol == "" || $this-&gt;_protocol === "file://") {
...
500   }
501
502   $contents = file_get_contents($file, null, $this-&gt;_http_context);
https://github.com/dompdf/dompdf/blob/v0.6.1/include/dompdf.cls.php

See the Proof of Concept section below for a demonstration of how this issue could be exploited.

It should be noted that the vulnerable code appears to have been ported to the newer v0.7 betas (under src/Dompdf.php loadHtmlFile), however exploitability has not been confirmed on these beta versions.

Proof of Concept:
-----------------
The following HTTP request can be used against a vulnerable server to exercise this vulnerability:
    http://localhost/dompdf/dompdf.php?input_file=FILE:///etc/passwd

This proof of concept requires that the DOMPDF_ENABLE_REMOTE configuration value in dompdf_config.inc.php be set to true.

This proof of concept demonstrates how the issue can be exploited to disclose the contents of arbitrary files on the underlying hosting server.

Disclosure Timeline
-------------------
20151007 - Initial Discovery and vendor contact
20151107 - Patch committed
</pre>
