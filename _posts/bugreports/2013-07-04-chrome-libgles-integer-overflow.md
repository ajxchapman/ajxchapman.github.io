---
layout: post
title: Chrome - Almost Native Graphics Layer Engine (ANGLE) library Integer Overflow
category: bugreports
---

The Almost Native Graphics Layer Engine (ANGLE) library as used in Google Chrome is vulnerable to an integer overflow vulnerability leading to memory corruption which may allow an attacker to exploit the browser process. The ANGLE library is used by Chrome on Windows as a bridge between the OpenGL ES 2.0 API and DirectX.

<!--more-->

*Original bug report can be viewed at [https://bugs.chromium.org/p/chromium/issues/detail?id=257363](https://bugs.chromium.org/p/chromium/issues/detail?id=257363)*

<pre class="bugreport">
Description:		Almost Native Graphics Layer Engine (ANGLE) library Integer Overflow
Versions Affected: 	Google Chrome 27.0.1453.116 m
Category: 		Memory Corruption
Reporter:		Alex Chapman of Context Information Security

Summary:
--------

The Almost Native Graphics Layer Engine (ANGLE) library as used in Google Chrome is vulnerable to an integer overflow vulnerability leading to memory corruption which may allow an attacker to exploit the browser process. The ANGLE library is used by Chrome on Windows as a bridge between the OpenGL ES 2.0 API and DirectX.

Note: As this is a bug in the ANGLE library a bug report has also been submitted to Mozilla.

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

The crash occurs within the renderer "gpu-process" (sad tab crash).

Example crash information from Chrome 27.0.1453.116 m:

    (1d48.1614): Access violation - code c0000005 (first chance)
    First chance exceptions are reported before any exception handling.
    This exception may be expected and handled.
    eax=04015000 ebx=7fffffff ecx=002e2c00 edx=00000000 esi=053fa7a8 edi=00000000
    eip=6fb8103c esp=0024e8ac ebp=0024e8bc iopl=0         nv up ei ng nz ac po cy
    cs=0023  ss=002b  ds=002b  es=002b  fs=0053  gs=002b             efl=00010293
    libglesv2!Ordinal147+0x239b:
    6fb8103c 890c88          mov     dword ptr [eax+ecx*4],ecx ds:002b:04ba0000=52455343


    ChildEBP RetAddr  Args to Child              
    WARNING: Stack unwind information not available. Following frames may be wrong.
    0024e8bc 6fb827b5 00000000 00000000 00000000 libglesv2!Ordinal147+0x239b
    0024e8e8 6fb6c03c 7ffffffe 00000000 7fffffff libglesv2!Ordinal147+0x3b14
    0024e924 6252486f 00000002 00000000 7fffffff libglesv2!glDrawArrays+0x4f
    0024e968 62524922 6338d5d0 00000000 00000002 chrome_61100000!gpu::gles2::GLES2DecoderImpl::DoDrawArrays+0x17d [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gles2_cmd_decoder.cc @ 6245]
    0024e988 6252a218 00000000 064108c8 00000232 chrome_61100000!gpu::gles2::GLES2DecoderImpl::HandleDrawArrays+0x1d [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gles2_cmd_decoder.cc @ 6271]
    0024ea84 6252e1fa 00000134 00000003 064108c8 chrome_61100000!gpu::gles2::GLES2DecoderImpl::DoCommand+0x3fe [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gles2_cmd_decoder.cc @ 3592]
    0024eab0 6251256a 00000000 0545b688 05455600 chrome_61100000!gpu::CommandParser::ProcessCommand+0xb6 [c:\b\build\slave\win\build\src\gpu\command_buffer\service\cmd_parser.cc @ 72]
    0024ed14 62513a85 05461d40 6367b8d3 0024ed64 chrome_61100000!gpu::GpuScheduler::PutChanged+0xe8 [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gpu_scheduler.cc @ 78]
    0024ed24 624a81af 00000243 00b0e0c0 05455604 chrome_61100000!gpu::CommandBufferService::Flush+0x26 [c:\b\build\slave\win\build\src\gpu\command_buffer\service\command_buffer_service.cc @ 92]
    0024ed64 6280b19e 00000243 00000019 00000243 chrome_61100000!content::GpuCommandBufferStub::OnAsyncFlush+0xb5 [c:\b\build\slave\win\build\src\content\common\gpu\gpu_command_buffer_stub.cc @ 669]
    0024ed7c 624a9f46 00b0e0c0 05455600 05455600 chrome_61100000!FileSystemHostMsg_CancelWrite::Dispatch&lt;content::FileAPIMessageFilter,content::FileAPIMessageFilter,void (__thiscall content::FileAPIMessageFilter::*)(int,int)&gt;+0x26 [c:\b\build\slave\win\build\src\content\common\fileapi\file_system_messages.h @ 138]
    0024eee8 611f0adc 01b0e0c0 00b0e0c0 0024ef34 chrome_61100000!content::GpuCommandBufferStub::OnMessageReceived+0x225 [c:\b\build\slave\win\build\src\content\common\gpu\gpu_command_buffer_stub.cc @ 187]
    0024eef8 624a461e 00b0e0c0 768fd383 00a6c250 chrome_61100000!content::MessageRouter::RouteMessage+0x24 [c:\b\build\slave\win\build\src\content\common\message_router.cc @ 50]
    0024ef34 61331af6 0024f5d8 0024ef54 613319a7 chrome_61100000!content::GpuChannel::HandleMessage+0xad [c:\b\build\slave\win\build\src\content\common\gpu\gpu_channel.cc @ 799]
    0024ef40 613319a7 624a4571 00000000 00a6c250 chrome_61100000!base::internal::InvokeHelper&lt;1,void,base::internal::RunnableAdapter&lt;void (__thiscall ChromeToMobileService::*)(void)&gt;,void __cdecl(base::WeakPtr&lt;ChromeToMobileService&gt; const &)&gt;::MakeItSo+0x37 [c:\b\build\slave\win\build\src\base\bind_internal.h @ 883]
    0024ef54 6113425b 00a6c240 0024f5d8 00a6c244 chrome_61100000!base::internal::Invoker&lt;1,base::internal::BindState&lt;base::internal::RunnableAdapter&lt;void (__thiscall ChromeToMobileService::*)(void)&gt;,void __cdecl(ChromeToMobileService *),void __cdecl(base::WeakPtr&lt;ChromeToMobileService&gt;)&gt;,void __cdecl(ChromeToMobileService *)&gt;::Run+0x15 [c:\b\build\slave\win\build\src\base\bind_internal.h @ 1173]
    0024efe8 61133c5e 0024f5d8 0024f010 00a1fe70 chrome_61100000!MessageLoop::RunTask+0x341 [c:\b\build\slave\win\build\src\base\message_loop.cc @ 478]


In addition to the above issue, a bug in the NVIDIA graphics driver (version information in gfx_driver_version.txt) and insufficient validation of the size of allocated memory returned by a call to IDirect3DDevice9::CreateIndexBuffer in StreamingIndexBuffer::reserveSpace (libGLESv2/IndexDataManager.cpp) can also trigger a similar heap overflow condition. With the buggy NVIDIA driver, calls to IDirect3DDevice9::CreateIndexBuffer with large memory sizes (e.g. 0xFFFF0004) fail to allocate the requested amount of memory, but return a success result (HRESULT 0). Subsequent code in StreamingIndexBuffer::reserveSpace does not check the size of memory allocated before returning the buffer to the Context::drawLineLoop function (libGLESv2/Context.cpp) to be used. Context::drawLineLoop proceeds to fill the insufficiently allocated memory with data, assuming a successful memory allocation, resulting in a heap overflow condition:

Example crash information from Chrome 27.0.1453.116 m:

    (21d8.1b44): Access violation - code c0000005 (first chance)
    First chance exceptions are reported before any exception handling.
    This exception may be expected and handled.
    eax=044aa000 ebx=3fffc000 ecx=002c5800 edx=00000000 esi=034d2fc8 edi=00000000
    eip=6e35103c esp=002ce46c ebp=002ce47c iopl=0         nv up ei ng nz na pe cy
    cs=0023  ss=002b  ds=002b  es=002b  fs=0053  gs=002b             efl=00010287
    libglesv2!Ordinal147+0x239b:
    6e35103c 890c88          mov     dword ptr [eax+ecx*4],ecx ds:002b:04fc0000=52455343


    ChildEBP RetAddr  Args to Child              
    WARNING: Stack unwind information not available. Following frames may be wrong.
    002ce47c 6e3527b5 00000000 00000000 00000000 libglesv2!Ordinal147+0x239b
    002ce4a8 6e33c03c 3fffbfff 00000000 3fffc000 libglesv2!Ordinal147+0x3b14
    002ce4e4 650f486f 00000002 00000000 3fffc000 libglesv2!glDrawArrays+0x4f
    002ce528 650f4922 65f5d5d0 00000000 00000002 chrome_63cd0000!gpu::gles2::GLES2DecoderImpl::DoDrawArrays+0x17d [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gles2_cmd_decoder.cc @ 6245]
    002ce548 650fa218 00000000 066808c8 00000232 chrome_63cd0000!gpu::gles2::GLES2DecoderImpl::HandleDrawArrays+0x1d [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gles2_cmd_decoder.cc @ 6271]
    002ce644 650fe1fa 00000134 00000003 066808c8 chrome_63cd0000!gpu::gles2::GLES2DecoderImpl::DoCommand+0x3fe [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gles2_cmd_decoder.cc @ 3592]
    002ce670 650e256a 00000000 02663e08 0266b000 chrome_63cd0000!gpu::CommandParser::ProcessCommand+0xb6 [c:\b\build\slave\win\build\src\gpu\command_buffer\service\cmd_parser.cc @ 72]
    002ce8d4 650e3a85 0274e7e0 6624b8d3 002ce924 chrome_63cd0000!gpu::GpuScheduler::PutChanged+0xe8 [c:\b\build\slave\win\build\src\gpu\command_buffer\service\gpu_scheduler.cc @ 78]
    002ce8e4 650781af 00000243 0274e9c0 0266b004 chrome_63cd0000!gpu::CommandBufferService::Flush+0x26 [c:\b\build\slave\win\build\src\gpu\command_buffer\service\command_buffer_service.cc @ 92]
    002ce924 653db19e 00000243 00000019 00000243 chrome_63cd0000!content::GpuCommandBufferStub::OnAsyncFlush+0xb5 [c:\b\build\slave\win\build\src\content\common\gpu\gpu_command_buffer_stub.cc @ 669]
    002ce93c 65079f46 0274e9c0 0266b000 0266b000 chrome_63cd0000!FileSystemHostMsg_CancelWrite::Dispatch&lt;content::FileAPIMessageFilter,content::FileAPIMessageFilter,void (__thiscall content::FileAPIMessageFilter::*)(int,int)&gt;+0x26 [c:\b\build\slave\win\build\src\content\common\fileapi\file_system_messages.h @ 138]
    002ceaa8 63dc0adc 0174e9c0 0274e9c0 002ceaf4 chrome_63cd0000!content::GpuCommandBufferStub::OnMessageReceived+0x225 [c:\b\build\slave\win\build\src\content\common\gpu\gpu_command_buffer_stub.cc @ 187]
    002ceab8 6507461e 0274e9c0 768fd383 0274e010 chrome_63cd0000!content::MessageRouter::RouteMessage+0x24 [c:\b\build\slave\win\build\src\content\common\message_router.cc @ 50]
    002ceaf4 63f01af6 002cf1a0 002ceb14 63f019a7 chrome_63cd0000!content::GpuChannel::HandleMessage+0xad [c:\b\build\slave\win\build\src\content\common\gpu\gpu_channel.cc @ 799]
    002ceb00 63f019a7 65074571 00000000 0274e010 chrome_63cd0000!base::internal::InvokeHelper&lt;1,void,base::internal::RunnableAdapter&lt;void (__thiscall ChromeToMobileService::*)(void)&gt;,void __cdecl(base::WeakPtr&lt;ChromeToMobileService&gt; const &)&gt;::MakeItSo+0x37 [c:\b\build\slave\win\build\src\base\bind_internal.h @ 883]
    002ceb14 63d0425b 0274e000 002cf1a0 0274e004 chrome_63cd0000!base::internal::Invoker&lt;1,base::internal::BindState&lt;base::internal::RunnableAdapter&lt;void (__thiscall ChromeToMobileService::*)(void)&gt;,void __cdecl(ChromeToMobileService *),void __cdecl(base::WeakPtr&lt;ChromeToMobileService&gt;)&gt;,void __cdecl(ChromeToMobileService *)&gt;::Run+0x15 [c:\b\build\slave\win\build\src\base\bind_internal.h @ 1173]
    002ceba8 63d03c5e 002cf1a0 002cebd0 0265fe70 chrome_63cd0000!MessageLoop::RunTask+0x341 [c:\b\build\slave\win\build\src\base\message_loop.cc @ 478]

These bugs have been tested on Windows 7 and 8.1 x64.
</pre>
