# C Programming Setup (Windows 11 + VS Code + MinGW)

This guide will help you run C programs for DSA.  
We will install a **C compiler (MinGW)** and connect it to **VS Code**.

You only need to do this once.

---

## What we are installing

| Tool                 | Why needed                                   |
| -------------------- | -------------------------------------------- |
| MinGW (GCC)          | Converts your C code into a program (.exe)   |
| VS Code              | Code editor where you write programs         |
| Environment Variable | Lets Windows find the compiler from terminal |

---

# Step 1 — Install VS Code

1. Go to: [https://code.visualstudio.com](https://code.visualstudio.com/)
    
2. Download **Windows version**
    
3. Install normally → keep all default options
    
4. Open VS Code once and close it
    

Done.

---

# Step 2 — Download MinGW (GCC Compiler)

1. Open this website:  
    [https://sourceforge.net/projects/mingw/](https://sourceforge.net/projects/mingw/)
    
2. Click **Download**
    

It will download a small installer file.

3. Open the installer
    

### Inside installer:

- Choose: **Basic Setup**
    
- Tick these packages:
    
    - mingw32-base
        
    - mingw32-gcc-g++
        

Now go to:

```
Installation → Apply Changes → Apply
```

Wait 5–10 minutes.  
This installs the C compiler.

---

# Step 3 — Add Compiler to Environment Variable (MOST IMPORTANT)

Without this, terminal cannot run `gcc`.

### Do this carefully:

1. Press **Windows key**
    
2. Search → `Environment Variables`
    
3. Click:
    

> Edit the system environment variables

4. Click **Environment Variables**
    

You will see 2 boxes.

In **System Variables** section:

Find:

```
Path
```

Select it → Click **Edit**

Now click:

```
New
```

Paste this path:

```
C:\MinGW\bin
```

Press:

```
OK → OK → OK
```

Restart the computer (IMPORTANT).

---

# Step 4 — Check if GCC is working

Open **Command Prompt** and type:

```
gcc --version
```

If you see version text → SUCCESS

If it says command not found → path is wrong.

---

# Step 5 — Setup VS Code for C

Open VS Code

### Install Extension

Press:

```
Ctrl + Shift + X
```

Search:

```
C/C++ (Microsoft)
```

Install it.

That’s all. No other extension needed.

---

# Step 6 — Run your first C program

Inside VS Code:

1. File → Open Folder → open your `DSA-CS401` folder
    
2. Create a file:
    

```
test.c
```

Paste this code:

```c
#include <stdio.h>
int main()
{
    printf("C is working!\n");
    return 0;
}
```

Save the file.

---

## Compile the program

Open VS Code Terminal:

```
Ctrl + `
```

Make sure terminal path is inside your folder.

Now type:

```
gcc test.c -o test
```

If no error → program compiled.

---

## Run the program

Type:

```
test
```

You should see:

```
C is working!
```

Now your C setup is complete.

---

# Common Errors

### gcc is not recognized

Reason: Environment variable wrong.

Fix:  
Recheck Path = `C:\MinGW\bin`  
Restart PC.

---

### Permission denied

You are not in correct folder.

Use:

```
dir
```

to see files.

---

### .exe not running

You forgot `-o test` while compiling.

Correct command:

```
gcc filename.c -o filename
```

---

# Important for DSA

You will use this compiler for:

- Linked List programs
    
- Stack & Queue
    
- Tree traversal
    
- Sorting algorithms
    

So if this step fails → DSA coding fails.

Do not skip setup.