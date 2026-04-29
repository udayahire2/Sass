# C Programming — Chapter 1: The Foundations

### _Written in the style of an Oxford University C Programming Course_

---

## Preface to This Chapter

Before you write a single line of C, understand one thing clearly: **C does not hold your hand.** Unlike modern languages that hide memory, manage types automatically, and forgive sloppy code — C exposes everything. That is precisely why learning C makes you a better programmer in _any_ language.

Read this chapter once, slowly. After that, it becomes your revision sheet.

---

## 1. Where a C Program Begins

Every C program has exactly one starting point — the `main()` function. Not the top of the file. Not the first function you wrote. Always, and without exception, `main()`.

```c
#include <stdio.h>

int main()
{
    printf("Hello");
    return 0;
}
```

Think of your `.c` file as a book. `main()` is the page the reader always opens to first — regardless of how many other pages exist.

---

### What Each Line Actually Does

**`#include <stdio.h>`** This is not just a formality. This line tells the compiler: _"I plan to use input/output functions like `printf` and `scanf`. Please make them available."_ Without it, the compiler simply does not know these functions exist.

**`int main()`** This is the program's entry point. When you run your program, the Operating System calls `main()` automatically. The `int` before it means the function will return an integer — a signal back to the OS.

**`printf("Hello");`** This is the first actual instruction that executes. Everything before this was setup.

**`return 0;`** This tells the OS: _"Program ended successfully."_ If you return any non-zero value, the OS interprets it as an error. This matters in real systems programming.

---

### The Journey from Code to Execution

When you press _Run_, something elegant happens behind the scenes — silently, in milliseconds:

```
Your Code (.c file)
      ↓
  Preprocessor  →  Expands #include, #define
      ↓
   Compiler     →  Checks syntax, converts to assembly
      ↓
  Assembler     →  Converts to machine code (binary)
      ↓
    Linker      →  Connects your code to library functions (printf, scanf, etc.)
      ↓
  Executable    →  Program runs
```

**Why this matters practically:** If you ever see this error —

```
undefined reference to 'printf'
```

— your _code_ is fine. The **Linker** failed to connect the library. Knowing this saves you from panicking over correct code.

---

## 2. Variables and Data Types

C is a statically typed language. This means one strict rule applies:

> **You must declare the type of data before you store it.**

This is not bureaucracy. C manages memory directly — it needs to know _how many bytes_ to reserve for each variable. There is no runtime type-checking, no safety net. You are working close to the hardware.

---

### The Four Fundamental Types

| Type     | What It Stores                     | Memory Used |
| -------- | ---------------------------------- | ----------- |
| `int`    | Whole numbers                      | 4 bytes     |
| `float`  | Decimal numbers (single precision) | 4 bytes     |
| `double` | Decimal numbers (double precision) | 8 bytes     |
| `char`   | A single character                 | 1 byte      |

```c
int   age    = 21;
float marks  = 89.5;
char  grade  = 'A';
double pi    = 3.1415926535;
```

---

### The Uninitialized Variable — A Trap You Must Avoid

Consider this code:

```c
int x;
printf("%d", x);
```

What does this print?

Not zero. Not an error. It prints a **garbage value** — whatever random bits happened to be sitting in that memory location from a previous operation.

This single mistake is responsible for a remarkable number of beginner bugs in DSA implementations. The fix is simple and must become a habit:

```c
int x = 0;   // Always initialize
```

---

### Why Memory Size Matters (Especially for DSA Later)

C does not store "values" in the way you might imagine. It stores **bits in specific memory locations**. When you write `int age = 21`, the number 21 is encoded as bits and placed in 4 consecutive bytes of RAM.

This understanding becomes absolutely essential when you reach pointers. Without it, pointers will feel like magic — and not the good kind.

---

## 3. Type Casting — Where Students Lose Marks

This is one of the most misunderstood areas in early C programming.

**The situation:**

```c
int a = 7, b = 2;
float r = a / b;
```

You expect `r` to be `3.5`. You get `3.0`.

**Why?** Because C evaluates `a / b` first. Both `a` and `b` are integers, so C performs _integer division_ — it discards the decimal part entirely. Only _then_ does it store the result in the `float` variable. By then, the information is already lost.

**The correct approach:**

```c
float r = (float)a / b;
```

By casting `a` to `float` before the division, you force C to perform floating-point division. Result: `3.5`.

---

### A Real-World DSA Example — The Binary Search Bug

This is not academic trivia. This has caused failures in actual technical interviews.

**Wrong:**

```c
mid = (l + r) / 2;
```

If `l` and `r` are large integers (say, close to `INT_MAX`), their _sum_ overflows — wraps around to a negative number — and your binary search breaks silently.

**Correct:**

```c
mid = l + (r - l) / 2;
```

This computes the same midpoint mathematically, but avoids overflow entirely. Remember this. Always.

---

## 4. Constants — Values That Must Not Change

When a value in your program should never be modified, you have two ways to enforce that in C.

**Method 1 — Using `const`:**

```c
const int MAX = 100;
const float PI = 3.14;
```

This creates a real variable in memory, but the compiler will refuse any attempt to modify it.

**Method 2 — Using `#define`:**

```c
#define MAX 100
```

This is a _preprocessor directive_. Before compilation even begins, the preprocessor scans your code and replaces every occurrence of `MAX` with `100`. No variable is created — it is pure text substitution.

---

### The Famous Macro Trap

```c
#define SQR(x) x * x

result = SQR(2 + 3);
```

You expect `25`. You get `11`.

Why? The preprocessor substitutes blindly:

```
SQR(2+3)  →  2 + 3 * 2 + 3  →  2 + 6 + 3  =  11
```

**The correct definition:**

```c
#define SQR(x) ((x) * (x))
```

Always wrap macro arguments — and the entire expression — in parentheses.

---

## 5. Input and Output

### Output with `printf`

```c
printf("%d", x);    // integer
printf("%f", y);    // float
printf("%c", ch);   // character
printf("%s", name); // string
```

The `%d`, `%f`, etc. are **format specifiers** — they tell `printf` how to interpret and display the value.

---

### Input with `scanf`

```c
int a;
scanf("%d", &a);
```

Notice the `&` before `a`. This is critical.

`scanf` does not just need to _read_ a value — it needs to _place_ that value into a specific location in memory. The `&` operator gives `scanf` the **memory address** of the variable, not its current value.

Without `&`, you are handing `scanf` the value of `a` (which is garbage at this point) and telling it to treat that garbage as an address. The result is a crash or undefined behaviour.

**The one exception — strings (character arrays):**

```c
char name[20];
scanf("%s", name);
```

Here, no `&` is needed. The name of an array in C _already represents its memory address_. This is your first quiet introduction to pointers.

---

## 6. Operators

### Arithmetic Operators

```
+   addition
-   subtraction
*   multiplication
/   division
%   modulo (remainder)
```

Key behaviour to internalize:

```
10 / 3  =  3    (integer division — decimal dropped)
10 % 3  =  1    (remainder)
```

The modulo operator (`%`) appears constantly in DSA:

- Even/odd checking
- Circular queues
- Hashing
- Array index wrapping

If you are weak on modulo, you will struggle with these.

---

### Comparison Operators

```
>    greater than
<    less than
>=   greater than or equal
<=   less than or equal
==   equal to
!=   not equal to
```

**The most common and dangerous mistake in C:**

```c
if (a = 5)   // Assignment — always evaluates to true
if (a == 5)  // Comparison — what you actually meant
```

The first line does not compare `a` with 5. It _assigns_ 5 to `a`, then uses the result (5, which is non-zero, i.e. true) as the condition. Your `if` block will always execute. The compiler may not warn you. This is a silent bug.

---

### Logical Operators

```
&&   AND — both conditions must be true
||   OR  — at least one must be true
!    NOT — inverts the condition
```

A practical example you will write hundreds of times in DSA:

```c
if (i >= 0 && i < n)
```

This checks whether index `i` is within valid array bounds. Both conditions must hold simultaneously. This is **bounds checking** — the habit that separates careful programmers from ones who cause buffer overflows.

---

### Increment and Decrement

```c
int a = 5;

b = ++a;   // Pre-increment:  a becomes 6 first, then b = 6
c = a++;   // Post-increment: c = 6 first, then a becomes 7
```

**Pre-increment (`++a`)** — increment first, use the new value. **Post-increment (`a++`)** — use the current value first, then increment.

This distinction becomes significant when you work with pointers and pointer arithmetic. If you are vague on this now, pointer expressions will confuse you completely later.

---

### Bitwise Operators — Do Not Skip These

```
&    Bitwise AND
|    Bitwise OR
^    Bitwise XOR
~    Bitwise NOT
<<   Left shift
>>   Right shift
```

The two you will see most often in DSA:

```c
x << 1   // equivalent to x × 2
x >> 1   // equivalent to x ÷ 2
```

Bitwise operations work directly on binary representations and are significantly faster than arithmetic operations. They appear in optimized algorithms, graphics, networking, and advanced DSA.

---

## Chapter Summary — What Actually Matters

C syntax can be looked up. What cannot be looked up in an exam or an interview is _understanding_. Here is what you genuinely need to have internalized from this chapter:

|Concept|Why It Matters|
|---|---|
|Integer division|Causes silent wrong answers in calculations|
|Uninitialized variables|Produces garbage values, breaks DSA logic|
|Memory addresses|Foundation of pointers, `scanf`, arrays|
|Overflow|Breaks binary search and arithmetic on large numbers|
|Pre vs Post increment|Critical for pointer expressions|
|`&` in `scanf`|Without it, your program crashes|
|Macro parentheses|Prevents silent expression evaluation bugs|

---

> **A final note from your professor:** Most students find DSA difficult not because the algorithms are complex, but because their understanding of what C is actually doing in memory is shallow. Every pointer, every array, every function call — it all rests on this foundation. Build it well now, and everything that follows will feel logical rather than mysterious.

---
