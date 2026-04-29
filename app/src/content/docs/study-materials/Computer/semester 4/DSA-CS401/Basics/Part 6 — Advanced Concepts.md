# C Programming — Chapter 6: Advanced Concepts

### _Recursion, File Handling, Macros, and the Tools That Complete Your C Foundation_

---

## Preface to This Chapter

This is the final chapter of your C foundation. Everything here connects directly to a DSA topic you will encounter soon. Recursion is not a curiosity — it is the only natural way to think about trees, graphs, and divide-and-conquer algorithms. The utility types and preprocessor tools in this chapter will clean up your code and make your implementations readable.

After this chapter, you will have no unfinished business with C. What follows is pure data structures.

---

## 1. Recursion

Recursion is a technique where a function **solves a problem by calling itself on a smaller version of the same problem**, until the problem becomes trivial enough to solve directly.

That trivial point is called the **base case**. Without it, the function calls itself indefinitely — exhausting memory and crashing the program. Every recursive function you write must have one.

---

### 1.1 The Structure of Every Recursive Function

```c
return_type func(parameters)
{
    // Step 1 — Base case: the simplest possible input; stop recursing here
    if (base_condition)
        return base_value;

    // Step 2 — Recursive case: reduce the problem and call again
    return func(smaller_parameters);
}
```

The discipline is always the same: identify when the problem is small enough to answer directly, return that answer, and for everything else, reduce the problem by one step and delegate to the next call.

---

### 1.2 Factorial — The Canonical Example

```c
int factorial(int n)
{
    if (n == 0 || n == 1)         // Base case: 0! = 1! = 1
        return 1;

    return n * factorial(n - 1);  // Recursive case: n! = n × (n-1)!
}
```

Tracing `factorial(4)` step by step:

```
factorial(4)
  → 4 × factorial(3)
      → 3 × factorial(2)
          → 2 × factorial(1)
              → returns 1
          → returns 2 × 1 = 2
      → returns 3 × 2 = 6
  → returns 4 × 6 = 24
```

Notice the shape: the calls go _down_ until the base case is reached, then the answers propagate _back up_, combining at each level. This descent-and-return pattern is the heartbeat of all recursive algorithms.

---

### 1.3 Fibonacci — Multiple Recursive Calls

```c
int fibonacci(int n)
{
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

Here, each call spawns _two_ more calls. This creates a tree of calls — and is the first hint of why tree traversal is naturally recursive. It is also an example of _inefficient_ recursion: `fibonacci(5)` recomputes `fibonacci(3)` multiple times. In DSA, this is solved with **memoisation** — storing previously computed results so they are never recalculated.

---

### 1.4 Sum of an Array — Recursion on Data Structures

```c
int sumArray(int arr[], int n)
{
    if (n == 0) return 0;                       // Base case: empty array sums to 0
    return arr[n - 1] + sumArray(arr, n - 1);   // Add last element + sum of rest
}
```

This pattern — handle one element, recurse on the remainder — is exactly how recursive linked list operations work. You will write functions that process the head node and recurse on `head->next` using this same logic.

---

### 1.5 Binary Search — Recursive Form

```c
int binarySearch(int arr[], int left, int right, int target)
{
    if (left > right)
        return -1;                               // Base case: search space exhausted

    int mid = left + (right - left) / 2;

    if (arr[mid] == target)
        return mid;                              // Found — return index
    else if (arr[mid] < target)
        return binarySearch(arr, mid + 1, right, target);   // Search right half
    else
        return binarySearch(arr, left, mid - 1, target);    // Search left half
}
```

Each call halves the search space. This is divide-and-conquer in its purest form, and it is the same structural logic used in Merge Sort and Binary Search Trees.

---

### 1.6 How the Call Stack Works During Recursion

Every function call in C consumes space on the **Call Stack** — a record of which function is currently executing, what its local variables are, and where to return when it finishes. Recursive calls stack up one on top of another:

```
factorial(3) called         → pushed onto stack
  factorial(2) called       → pushed onto stack
    factorial(1) called     → pushed onto stack
      returns 1             → popped from stack
    returns 2 × 1 = 2       → popped from stack
  returns 3 × 2 = 6         → popped from stack
```

If recursion goes too deep — say, `factorial(100000)` — the stack overflows and the program crashes. This is called a **stack overflow**. For very deep problems, an iterative solution or memoisation is the correct approach.

---

### 1.7 Where Recursion Appears in DSA

|Algorithm|How Recursion Is Used|
|---|---|
|Merge Sort|Divide array in half; sort each half; merge|
|Quick Sort|Partition around a pivot; recurse on each partition|
|Tree Traversal|Visit node; recurse left; recurse right|
|DFS (Graph)|Visit node; recurse into each unvisited neighbour|
|Tower of Hanoi|Move n-1 discs out of the way; move the largest; move n-1 back|
|Backtracking|Explore a choice; if it fails, undo it and try the next|

Every one of these algorithms will feel natural once you are comfortable thinking recursively. That comfort comes from practice — trace the calls by hand until the pattern becomes instinctive.

---

## 2. File Handling

File handling allows your program to persist data beyond its runtime — reading from and writing to files stored on disk. In larger DSA projects, this is how you load test data, save results, and work with datasets too large to type manually.

```c
#include <stdio.h>

int main()
{
    // --- Writing to a file ---
    FILE *fp = fopen("data.txt", "w");    // Open for writing; creates file if absent

    if (fp == NULL)
    {
        printf("Error: could not open file.\n");
        return 1;
    }

    fprintf(fp, "Hello File!\n");
    fprintf(fp, "%d\n", 42);
    fclose(fp);                           // Always close after writing

    // --- Reading from a file ---
    FILE *fr = fopen("data.txt", "r");    // Open for reading

    char line[100];
    while (fgets(line, 100, fr) != NULL)
        printf("%s", line);

    fclose(fr);
    return 0;
}
```

Always check that `fopen` did not return `NULL` — if the file does not exist (in read mode) or cannot be created, it returns `NULL`. Always call `fclose` when finished; leaving files open wastes system resources.

---

### 2.1 File Opening Modes

|Mode|Meaning|
|---|---|
|`"r"`|Read — file must already exist|
|`"w"`|Write — creates the file; overwrites if it exists|
|`"a"`|Append — adds to the end; creates if absent|
|`"r+"`|Read and write simultaneously|
|`"rb"`|Read in binary mode|
|`"wb"`|Write in binary mode|

---

## 3. Preprocessors and Macros

The **preprocessor** runs before the compiler sees your code. Every line beginning with `#` is a preprocessor directive — it performs text transformations on your source file before compilation begins.

```c
#include <stdio.h>       // Replace this line with the entire stdio.h file
#include "myfile.h"      // Same, for your own header files

#define MAX  100
#define PI   3.14159
```

---

### 3.1 Function-Like Macros

Macros can accept arguments and behave like inline functions — without the overhead of an actual function call:

```c
#define MAX_OF(a, b)   ((a) > (b) ? (a) : (b))
#define ABS(x)         ((x) < 0 ? -(x) : (x))
#define SWAP(a, b)     { int t = a; a = b; b = t; }
```

Always wrap arguments and the entire expression in parentheses — recall from Chapter 1 the `SQR` macro disaster. The preprocessor performs blind text substitution; parentheses ensure the expression evaluates correctly regardless of what is passed.

---

### 3.2 Conditional Compilation

```c
#ifdef DEBUG
    printf("Debug: x = %d\n", x);
#endif
```

This block is compiled only if `DEBUG` has been defined. It is the standard way to include diagnostic output during development and strip it out entirely for release — without deleting any code.

---

### 3.3 Include Guards — Preventing Double Inclusion

```c
#ifndef MYHEADER_H
#define MYHEADER_H

// All declarations go here

#endif
```

When the same header file is included from multiple source files, the include guard ensures its contents are processed only once. Without it, the compiler sees duplicate declarations and throws errors.

---

## 4. `NULL`, `void`, and `typedef`

These three are not flashy, but they appear in virtually every well-written C program and every DSA implementation you will study.

---

### 4.1 `NULL` — The Absence of an Address

`NULL` is defined as address `0` — a location guaranteed to be invalid. It represents the deliberate absence of a pointer value.

```c
int *p = NULL;              // Safe uninitialised pointer

struct Node *head = NULL;   // Standard representation of an empty linked list

if (ptr == NULL)
    printf("No node here.\n");
```

In linked lists, `NULL` carries structural meaning: a `next` pointer set to `NULL` marks the last node. A `head` pointer equal to `NULL` means the list is empty. Every traversal loop and every boundary check in linked list code depends on this convention.

---

### 4.2 `void` — The Absence of a Type

`void` serves two purposes: as a function return type meaning _"this function returns nothing"_, and as a pointer type meaning _"this pointer can point to anything"_.

```c
void greet() { printf("Hi\n"); }    // Returns nothing

void *genericPtr;                    // Generic pointer — no specific type
int x = 5;
genericPtr = &x;
printf("%d\n", *(int *) genericPtr);  // Must cast to a concrete type before dereferencing
```

`void *` appears in standard library functions like `malloc` — which is why you cast the return value to the appropriate pointer type.

---

### 4.3 `typedef` — Giving Types Readable Names

`typedef` creates an **alias** for an existing type, reducing verbosity and making complex type declarations readable.

```c
typedef unsigned long long int ull;
ull bigNumber = 1000000000000ULL;
```

Its most important use in DSA is with structures:

```c
typedef struct Node
{
    int          data;
    struct Node *next;
} Node;
```

Without this, every declaration requires the `struct` keyword:

```c
struct Node *head = NULL;   // Verbose — every single time
```

With `typedef`, you write simply:

```c
Node *head = NULL;          // Clean, readable
```

In a linked list implementation with dozens of node declarations, this difference is significant. Every professional DSA implementation you will read uses `typedef` for its node structures.

You can also create aliases for function pointers — a more advanced use seen in sorting algorithms that accept a custom comparator:

```c
typedef int (*CompareFunc)(int, int);
```

This defines `CompareFunc` as an alias for _"a pointer to a function that takes two ints and returns an int"_ — the exact signature used in functions like `qsort`.

---

## Chapter Summary

|Concept|What You Must Know|
|---|---|
|Base case|Every recursive function must have one — it is what stops the recursion|
|Recursive case|Reduce the problem by one step and delegate to the next call|
|Call stack|Each recursive call consumes stack space; too many causes stack overflow|
|Fibonacci inefficiency|Multiple calls recompute the same values — solved by memoisation|
|`fopen` / `fclose`|Always check for NULL; always close the file when done|
|File modes|`"r"` reads, `"w"` writes/overwrites, `"a"` appends|
|Macro parentheses|Always wrap arguments and expression — prevents silent evaluation errors|
|Include guards|Prevent duplicate declarations when headers are included multiple times|
|`NULL` in linked lists|Marks the last node (`next == NULL`) and the empty list (`head == NULL`)|
|`typedef struct`|Eliminates the `struct` keyword from every declaration — used everywhere|

---

> **Your professor's closing note on this chapter:** You have now completed the full C foundation. Look back at what you have covered: variables and memory, control flow, functions, arrays, pointers, dynamic allocation, structures, and recursion. Every data structure in existence is built from some combination of these tools. A linked list is a structure with a pointer to the next structure, allocated dynamically, traversed with a loop or recursion. A binary tree is the same idea with two pointers instead of one. A graph is nodes and edges represented as arrays of structures or arrays of pointers. Nothing that follows is fundamentally new — it is these same tools, arranged with greater sophistication.

---
