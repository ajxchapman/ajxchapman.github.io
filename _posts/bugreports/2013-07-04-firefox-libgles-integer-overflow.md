---
layout: post
title: Firefox - Almost Native Graphics Layer Engine (ANGLE) library Integer Overflow
category: bugreports
---

The Almost Native Graphics Layer Engine (ANGLE) library as used in Mozilla Firefox
is vulnerable to an integer overflow vulnerability leading to memory corruption
which may allow an attacker to exploit the browser process. The ANGLE library is
used by Firefox on Windows as a bridge between the OpenGL ES 2.0 API and DirectX.

<!--more-->

*Original bug report can be viewed at [https://bugzilla.mozilla.org/show_bug.cgi?id=890277](https://bugzilla.mozilla.org/show_bug.cgi?id=890277)*

<pre class="bugreport">
Description:		Almost Native Graphics Layer Engine (ANGLE) library Integer Overflow
Versions Affected: 	Mozilla Firefox 22.0, Mozilla Nightly 25.0a1 (2013-07-03)
Category: 		Memory Corruption
Reporter:		Alex Chapman of Context Information Security

Summary:
--------

The Almost Native Graphics Layer Engine (ANGLE) library as used in Mozilla Firefox is vulnerable to an integer overflow vulnerability leading to memory corruption which may allow an attacker to exploit the browser process. The ANGLE library is used by Firefox on Windows as a bridge between the OpenGL ES 2.0 API and DirectX.

Note: As this is a bug in the ANGLE library a bug report has also been submitted to Google.

Analysis:
---------

The issue occurs due to insufficient bounds checking prior to integer multiplication within the Context::drawLineLoop function (libGLESv2/Context.cpp):

    const int spaceNeeded = (count + 1) * sizeof(unsigned int);

    if (!mLineLoopIB)
    {
        mLineLoopIB = new StreamingIndexBuffer(mDevice, INITIAL_INDEX_BUFFER_SIZE, D3DFMT_INDEX32);
    }

    if (mLineLoopIB)
    {
        mLineLoopIB-&gt;reserveSpace(spaceNeeded, GL_UNSIGNED_INT);

        UINT offset = 0;
        unsigned int *data = static_cast&lt;unsigned int*&gt;(mLineLoopIB-&gt;map(spaceNeeded, &offset));
        startIndex = offset / 4;

        if (data)
        {
            switch (type)
            {
              case GL_NONE:   // Non-indexed draw
                for (int i = 0; i &lt; count; i++)
                {
                    data[i] = i;
                }
                data[count] = 0;
                break;

The count variable is directly controlled from javascript with no validation performed by the ANGLE library. Context::drawLineLoop proceeds to request a buffer using the overflowed spaceNeeded variable as the size, and fill the insufficiently allocated memory with data resulting in a heap overflow condition.

Example crash information from Firefox 22.0:

    (1788.17d4): Access violation - code c0000005 (first chance)
    First chance exceptions are reported before any exception handling.
    This exception may be expected and handled.
    eax=06723000 ebx=7fffffff ecx=00218800 edx=0057d160 esi=0286a368 edi=00000000
    eip=69075035 esp=0057d174 ebp=0057d188 iopl=0         nv up ei ng nz ac po cy
    cs=0023  ss=002b  ds=002b  es=002b  fs=0053  gs=002b             efl=00210293
    libGLESv2!gl::Context::drawLineLoop+0x123:
    69075035 890c88          mov     dword ptr [eax+ecx*4],ecx ds:002b:06f85000=????????


    ChildEBP RetAddr  Args to Child              
    0057d188 69074d23 00000000 00000000 00000000 libGLESv2!gl::Context::drawLineLoop+0x123 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\gfx\angle\src\libglesv2\context.cpp @ 3250]
    0057d1b4 6907a5c7 00000002 00000000 7fffffff libGLESv2!gl::Context::drawArrays+0xee [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\gfx\angle\src\libglesv2\context.cpp @ 3105]
    0057d1ec 61c2d9a2 00000002 00000000 7fffffff libGLESv2!glDrawArrays+0x4d [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\gfx\angle\src\libglesv2\libglesv2.cpp @ 16707566]
    0057d200 62026f18 0fae7400 00000002 00000000 xul!mozilla::gl::GLContext::fDrawArrays+0x17 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\obj-firefox\dist\include\glcontext.h @ 685]
    0057d238 62029022 0bf4a6a0 00000002 00000000 xul!mozilla::WebGLContext::DrawArrays+0x123 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\content\canvas\src\webglcontextgl.cpp @ 1472]
    0057d25c 61e59774 0c064600 0057d29c 0bf4a6a0 xul!mozilla::dom::WebGLRenderingContextBinding::drawArrays+0x83 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\obj-firefox\dom\bindings\webglrenderingcontextbinding.cpp @ 5502]
    0057d28c 6a9f9515 0c064600 00000003 057d4190 xul!mozilla::dom::WebGLRenderingContextBinding::genericMethod+0xcd [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\obj-firefox\dom\bindings\webglrenderingcontextbinding.cpp @ 10325]
    0057d2e8 6a9e75ea 0c064600 00000000 04ca0070 mozjs!js::InvokeKernel+0x115 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\js\src\jsinterp.cpp @ 390]


In addition to the above issue, a bug in the NVIDIA graphics driver (version information in gfx_driver_version.txt) and insufficient validation of the size of allocated memory returned by a call to IDirect3DDevice9::CreateIndexBuffer in StreamingIndexBuffer::reserveSpace (libGLESv2/IndexDataManager.cpp) can also trigger a similar heap overflow condition. With the buggy NVIDIA driver, calls to IDirect3DDevice9::CreateIndexBuffer with large memory sizes (e.g. 0xFFFF0004) fail to allocate the requested amount of memory, but return a success result (HRESULT 0). Subsequent code in StreamingIndexBuffer::reserveSpace does not check the size of memory allocated before returning the buffer to the Context::drawLineLoop function (libGLESv2/Context.cpp) to be used. Context::drawLineLoop proceeds to fill the insufficiently allocated memory with data, assuming a successful memory allocation, resulting in a heap overflow condition:

Example crash information from Friefox 22.0:

    (15b8.2280): Access violation - code c0000005 (first chance)
    First chance exceptions are reported before any exception handling.
    This exception may be expected and handled.
    eax=06756000 ebx=3fffc000 ecx=001c2c00 edx=004ed6a0 esi=02afa9f0 edi=00000000
    eip=690c5035 esp=004ed6b4 ebp=004ed6c8 iopl=0         nv up ei ng nz na pe cy
    cs=0023  ss=002b  ds=002b  es=002b  fs=0053  gs=002b             efl=00210287
    libGLESv2!gl::Context::drawLineLoop+0x123:
    690c5035 890c88          mov     dword ptr [eax+ecx*4],ecx ds:002b:06e61000=????????



    ChildEBP RetAddr  Args to Child              
    004ed6c8 690c4d23 00000000 00000000 00000000 libGLESv2!gl::Context::drawLineLoop+0x123 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\gfx\angle\src\libglesv2\context.cpp @ 3250]
    004ed6f4 690ca5c7 00000002 00000000 3fffc000 libGLESv2!gl::Context::drawArrays+0xee [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\gfx\angle\src\libglesv2\context.cpp @ 3105]
    004ed72c 61c2d9a2 00000002 00000000 3fffc000 libGLESv2!glDrawArrays+0x4d [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\gfx\angle\src\libglesv2\libglesv2.cpp @ 16707566]
    004ed740 62026f18 0c069400 00000002 00000000 xul!mozilla::gl::GLContext::fDrawArrays+0x17 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\obj-firefox\dist\include\glcontext.h @ 685]
    004ed778 62029022 0c1474f0 00000002 00000000 xul!mozilla::WebGLContext::DrawArrays+0x123 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\content\canvas\src\webglcontextgl.cpp @ 1472]
    004ed79c 61e59774 0c264600 004ed7dc 0c1474f0 xul!mozilla::dom::WebGLRenderingContextBinding::drawArrays+0x83 [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\obj-firefox\dom\bindings\webglrenderingcontextbinding.cpp @ 5502]
    004ed7cc 6aa19515 0c264600 00000003 0552b2b0 xul!mozilla::dom::WebGLRenderingContextBinding::genericMethod+0xcd [e:\builds\moz2_slave\rel-m-rel-w32_bld-000000000000\build\obj-firefox\dom\bindings\webglrenderingcontextbinding.cpp @ 10325]
</pre>
