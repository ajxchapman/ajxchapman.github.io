---
layout: post
title: Seccomp and Seccomp-BPF
category: linux
---

This post delves into the details of seccomp and seccomp-BPF, how they are implemented and how developers can configure them. Seccomp and Seccomp-BPF are used to limit the system calls available to a Linux process. Typically developers will implement a seccomp configuration for their application, however seccomp configurations can also be applied by system administrators to pre-compiled applications using various tricks.

<!--more-->

***Updated 20160904: The Seccomp Untrusted Code section has been updated.***

### Seccomp
Secure Computing Mode (seccomp), introduced into the Linux kernel in version 2.6.12 (8th March 2005), restricts the system calls available to a process to only four permitted calls, `read`, `write`, `_exit` and `sigreturn`. Seccomp was Originally developped to enable Cpushare +[Securely renting out your CPU with Linux](https://lwn.net/Articles/120647/), a system for renting out unused CPU cycles to execute untrusted code. The seccomp status is set per-thread, requiring each thread in a process to configure seccomp independently.

A simple example of using seccomp in an application is as follows:
```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/prctl.h>
#include <linux/seccomp.h>

void configure_seccomp() {
  printf("Configuring seccomp\n");
  prctl(PR_SET_SECCOMP, SECCOMP_MODE_STRICT);
}

int main(int argc, char* argv[]) {
  int infd, outfd;
  ssize_t read_bytes;
  char buffer[1024];

  if (argc < 3) {
    printf("Usage:\n\tdup_file <input path> <output_path>\n");
    return -1;
  }

  configure_seccomp();

  printf("Opening '%s' for reading\n", argv[1]);
  if ((infd = open(argv[1], O_RDONLY)) > 0) {
    printf("Opening '%s' for writing\n", argv[2]);
    if ((outfd = open(argv[2], O_WRONLY | O_CREAT, 0644)) > 0) {
        while((read_bytes = read(infd, &buffer, 1024)) > 0)
          write(outfd, &buffer, (ssize_t)read_bytes);
    }
  }
  close(infd);
  close(outfd);
  return 0;
}
```

When run, seccomp will terminate the application when executing the `open(argv[1], O_RDONLY)` function call, as can be seen below:
```bash
$ ./dup_file /etc/passwd output
Ducplicating file '/etc/passwd' to 'output'
Configuring seccomp
Opening '/etc/passwd' for reading
Killed
```

### Seccomp-BPF
Whilst seccomp is good for absolute restrictions, a more fine grained approach is required when attempting to lock down more complex applications. In order to solve this problem Seccomp - Berkley Packet Filter (Seccomp-BPF) was introduced. Seccomp-BPF uses BPF programs to filter on arbitrary syscalls and their arguments (constants only, no pointer dereference). As with seccomp strict mode, seccomp filter mode is set per-thread, requiring each thread in a process to configure seccomp independently. Seccomp-BPF was introduced into the Linux kernel in version 3.5 (21st July 2012) for x86/x86_64 systems and Linux kernel version 3.10 (30th June 2013) for ARM systems.

Seccomp-BPF uses a subset of the BPF functionality which has the following features:

* BPF programs executed in a Virtual Machine implemented in the kernel
  * Different implementations depending on processor architecture
* Simple instruction set
  * Conditional JMP
    * Takes two destinations, one for true and one for false
    * Jmp destinations are instruction offsets, maximum 255
  * JMP
    * Jmp destinations are instruction offsets
    * Permits offsets greater than 255
  * Load
    * Load from program arguments
    * Load from 16 slot memory region
  * Store
    * Store to 16 slot memory region
  * Arithmetic
    * Add, Subtract, Multiply, Divide, And, Or, Xor, Left Shift, Right Shift, Negate
  * Return
    * SECCOMP_RET_ALLOW - Permits the system call to proceed
    * SECCOMP_RET_KILL - Immediately terminates the process
    * SECCOMP_RET_ERRNO - Returns an error in the errno value
    * SECCOMP_RET_TRACE - Notify attached ptrace tracer (if exists)
    * SECCOMP_RET_TRAP - Send a SIGSYS signal to the process
* Program must finish with a Return
* Only branch-forward instructions
    * No loops
* Limited to 4096 instructions in length

See +[Linux Socket Filtering aka Berkeley Packet Filter (BPF)](https://www.kernel.org/doc/Documentation/networking/filter.txt), +[SECure COMPuting with filters](https://www.kernel.org/doc/Documentation/prctl/seccomp_filter.txt), and +[Using seccomp to limit the kernel attack surface](http://man7.org/conf/lpc2015/limiting_kernel_attack_surface_with_seccomp-LPC_2015-Kerrisk.pdf) for further details.

The permitted BPF instructions and limitations are defined in the kernel source in `/source/net/core/filter.c[685]: chk_code_allowed`+[Linux/net/core/filter.c](http://lxr.free-electrons.com/source/net/core/filter.c#L685) and further restricted in `/source/kernel/seccomp.c[100]: seccomp_check_filter`+[Linux/kernel/seccomp.c](http://lxr.free-electrons.com/source/kernel/seccomp.c#L100). The `seccomp_check_filter` restrictions reduces the BPF instruction set and ensures that absolute memory reads only read from the seccomp-BPF program inputs.

Each Seccomp-BPF program receives the following struct as an input argument+[Linux/include/uapi/linux/seccomp.h](http://lxr.free-electrons.com/source/include/uapi/linux/seccomp.h#L47):
```c
struct seccomp_data {
  int nr ;                    /* System call number */
  __u32 arch ;                /* AUDIT_ARCH_ * value */
  __u64 instruction_pointer ; /* CPU IP */
  __u64 args [6];             /* System call arguments */
};
```

In order to configure a seccomp-BPF program, the caller must have the `CAP_SYS_ADMIN` capability, or the calling thread must have the `no_new_priv` bit set +[seccomp - operate on Secure Computing state of the process](http://man7.org/linux/man-pages/man2/seccomp.2.html). The `no_new_privs` bit can be set with a call to prctl:
```c
  prctl(PR_SET_NO_NEW_PRIVS, 1);
```
This ensures that a malicious process cannot configure a bad seccomp-BPF program and then `execve` to a set-uid program, potentially permitting privilege escalation.

A simple example of using seccomp-BPF in an application is as follows:
```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <stddef.h>
#include <sys/prctl.h>
#include <linux/seccomp.h>
#include <linux/filter.h>
#include <linux/unistd.h>

void configure_seccomp() {
  struct sock_filter filter [] = {
    BPF_STMT(BPF_LD | BPF_W | BPF_ABS, (offsetof(struct seccomp_data, nr))),
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, __NR_write, 0, 1),
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW),
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, __NR_open, 0, 3),
    BPF_STMT(BPF_LD | BPF_W | BPF_ABS, (offsetof(struct seccomp_data, args[1]))),
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, O_RDONLY, 0, 1),
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW),
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_KILL)
  };

  struct sock_fprog prog = {
       .len = (unsigned short)(sizeof(filter) / sizeof (filter[0])),
       .filter = filter,
  };

  printf("Configuring seccomp\n");
  prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0);
  prctl(PR_SET_SECCOMP, SECCOMP_MODE_FILTER, &prog);
}

int main(int argc, char* argv[]) {
  int infd, outfd;
  ssize_t read_bytes;
  char buffer[1024];

  if (argc < 3) {
    printf("Usage:\n\tdup_file <input path> <output_path>\n");
    return -1;
  }
  printf("Ducplicating file '%s' to '%s'\n", argv[1], argv[2]);

  configure_seccomp();

  printf("Opening '%s' for reading\n", argv[1]);
  if ((infd = open(argv[1], O_RDONLY)) > 0) {
    printf("Opening '%s' for writing\n", argv[2]);
    if ((outfd = open(argv[2], O_WRONLY | O_CREAT, 0644)) > 0) {
        while((read_bytes = read(infd, &buffer, 1024)) > 0)
          write(outfd, &buffer, (ssize_t)read_bytes);
    }
  }
  close(infd);
  close(outfd);
  return 0;
}
```

In this case, the seccomp-BPF program will permit the first call to `open` with the `O_RDONLY` argument, but terminate the application when `open` is called with the `O_WRONLY | O_CREAT` argument. This can be seen below:
```bash
$ ./dup_file /etc/passwd output
Ducplicating file '/etc/passwd' to 'output'
Configuring seccomp
Opening '/etc/passwd' for reading
Opening 'output' for writing
Bad system call
```

One pitfall of using seccomp-BPF is filtering on system call numbers without checking the `seccomp_data->arch` BPF program argument +(https://www.kernel.org/doc/Documentation/prctl/seccomp_filter.txt). This should be checked in a seccomp-BPF program as below:
```c
  struct sock_filter filter [] = {
    BPF_STMT(BPF_LD | BPF_W | BPF_ABS, (offsetof(struct seccomp_data, arch))),
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, AUDIT_ARCH_X86_64, 1, 0),
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_KILL),
    ...
  }
```

Libraries such as libseccomp +[GitHub - seccomp/libseccomp: The main libseccomp repository](https://github.com/seccomp/libseccomp) can wrap the architecture check and make defining BPF programs significantly easier.

### Seccomp Status
In order to check whether a process is running under seccomp a `prctl` operation was introduced, `PR_GET_SECCOMP`. This led to intresting behaviour in processes with `SECCOMP_MODE_STRICT` protection, if seccomp was not configured the `prctl` operation would return 0, if seccomp was configured the process would be killed.

> It is, Kerrisk said, evidence that kernel developers do have a sense of humor
>
> [https://lwn.net/Articles/656307/](https://lwn.net/Articles/656307/)

Since kernel 3.8 the process status can be checked to determine whether a process is running with seccomp protection +(http://man7.org/conf/lpc2015/limiting_kernel_attack_surface_with_seccomp-LPC_2015-Kerrisk.pdf):
```c
grep Seccomp /proc/<pid>/status
```
0: Seccomp is not enabled
1: Seccomp "strict mode" is enabled
2: Seccomp-bpf is enabled


### Seccomp Unaware Processes
Whilst seccomp is primarily designed for restricting the available syscalls of the current process, various tricks can be employed to apply seccomp configurations to non-seccomp processes.

#### LD_PRELOAD
The `LD_PRELOAD` environment can be set to load a shared library into a target process in order to configure seccomp before running the process entry function. As an example:
```c
#include <stdio.h>
#include <sys/prctl.h>
#include <linux/seccomp.h>

__attribute__((constructor)) void configure_seccomp(void) {
  struct sock_filter filter [] = {
    //...
  };

  struct sock_fprog prog = {
       .len = (unsigned short)(sizeof(filter) / sizeof (filter[0])),
       .filter = filter,
  };

  printf("Configuring seccomp\n");
  prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0);
  prctl(PR_SET_SECCOMP, SECCOMP_MODE_FILTER, &prog);

}
```

```bash
$ LD_PRELOAD=/seccomp/seccomp.so ./dup_file /etc/passwd output
Configuring seccomp
Ducplicating file '/etc/passwd' to 'output'
Opening '/etc/passwd' for reading
Killed
```

This method will work with both `SECCOMP_MODE_STRICT` and `SECCOMP_MODE_FILTER` seccomp modes. Using this method a Seccomp-BPF "trainer" could be implemented using ptrace and the SECCOMP_RET_TRACE BPF return value to view the syscalls used by a process.

**It should be noted however, that this method should not be used to sandbox malicious code. Malicious code may be linked in such a way that the LD_PRELOAD environment is not respected, bypassing the seccomp configuration all together.** Thanks to [@tehjh](https://twitter.com/tehjh) for pointing this out.
