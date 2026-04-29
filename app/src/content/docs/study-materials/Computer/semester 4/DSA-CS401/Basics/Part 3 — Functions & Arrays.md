# C Programming — Chapter 3: Functions & Arrays

### _The Building Blocks of Every Data Structure You Will Ever Write_

---

## Preface to This Chapter

In the previous chapter, you learned to control the _flow_ of a program. Now you will learn to give that logic _structure_. Functions let you organise code into named, reusable operations. Arrays give you your first true data structure — a block of memory you can reason about, traverse, and manipulate systematically.

Every DSA operation you will ever implement — insertion, deletion, search, sort — will be a function operating on an array (or something built from one). This chapter is where that journey begins.

---

## 1. Functions

A function is a **named, self-contained block of code** that performs a specific task and can be called as many times as needed from anywhere in your program.

Without functions, DSA code becomes an unreadable wall of logic. With them, a stack becomes five clean operations: `push`, `pop`, `peek`, `isEmpty`, `isFull`.

---

### 1.1 The Structure of a Function

```c
return_type function_name(parameter_list)
{
    // body
    return value;
}
```

Every function has three aspects you must understand clearly — its **return type** (what it gives back), its **parameters** (what information it receives), and its **body** (what it actually does).

---

### 1.2 A Complete Working Example

```c
#include <stdio.h>

// Function prototype — declares that this function exists
// Must appear before main() if definition comes after
int add(int a, int b);

int main()
{
    int result = add(3, 5);    // Function call
    printf("Sum = %d\n", result);
    return 0;
}

// Function definition — the actual implementation
int add(int a, int b)
{
    return a + b;
}
```

The **prototype** (also called a declaration) tells the compiler: _"A function called `add` exists, it takes two integers, and it returns an integer."_ This allows `main()` to call `add()` even though the full definition appears later in the file.

---

### 1.3 `void` Functions — When There Is Nothing to Return

When a function performs an action but has no value to give back, its return type is `void`.

```c
void greet(char name[])
{
    printf("Hello, %s!\n", name);
    // No return statement needed
}

int main()
{
    greet("Rahul");
    return 0;
}
```

A `void` function with no parameters is a common pattern for displaying menus in DSA programs:

```c
void showMenu()
{
    printf("1. Push\n");
    printf("2. Pop\n");
    printf("3. Exit\n");
}
```

---

### 1.4 Why Functions Are Indispensable in DSA

Consider how a stack is actually implemented in C. Without functions, you would rewrite the push and pop logic every time you needed it. With functions:

```c
void push(int stack[], int *top, int value);
int  pop(int stack[], int *top);
int  peek(int stack[], int top);
int  isEmpty(int top);
int  isFull(int top, int maxSize);
```

Each operation is isolated, testable, and reusable. This is not just good style — it is the only practical way to build anything beyond a trivial program.

---

## 2. Arrays

An array is a **contiguous block of memory** storing multiple elements of the same type, accessible through a single name and an index.

It is the simplest data structure, and it is the foundation upon which stacks, queues, heaps, and hash tables are built.

---

### 2.1 Declaration and Initialisation

```c
int arr[5];                         // Declaration — 5 integers, all garbage values
int arr[5] = {10, 20, 30, 40, 50}; // Fully initialised
int arr[]  = {1, 2, 3, 4, 5};      // Size inferred automatically (= 5)
int arr[5] = {0};                   // All elements set to zero
int arr[5] = {1, 2};               // First two set; remaining default to 0
```

Always be deliberate about initialisation. An uninitialised array contains garbage values — and a sort or search running on garbage data will produce garbage results.

---

### 2.2 Accessing Elements

```c
printf("%d\n", arr[0]);   // First element — index always starts at 0
printf("%d\n", arr[4]);   // Last element — always (size - 1)
arr[2] = 99;              // Modify the element at index 2
```

**The most important rule:** Array indices in C run from `0` to `n-1`. There is no index `n`. Accessing `arr[n]` is an error — and C will not stop you.

> **Out of bounds — C's silent danger:** If you access `arr[10]` on a size-5 array, C will not throw an error or crash immediately. It will silently read or write to whatever memory sits beyond the array — corrupting data in ways that may not manifest until much later. This is one of the most difficult bugs to diagnose in C programming.

---

### 2.3 How an Array Sits in Memory

Understanding the memory layout of an array is essential before pointers make sense.

```
int arr[5] = {10, 20, 30, 40, 50};

Memory Address:   1000   1004   1008   1012   1016
Stored Value:       10     20     30     40     50
Array Index:      [0]    [1]    [2]    [3]    [4]
```

Each `int` occupies 4 bytes, so each successive element is 4 bytes further along in memory. The variable `arr` itself does not store the values — it stores the **address of the first element** (`1000`). This is why arrays and pointers are so closely related in C.

---

### 2.4 Traversal

```c
int arr[] = {5, 10, 15, 20, 25};
int n = 5;

// Forward traversal
for (int i = 0; i < n; i++)
    printf("%d ", arr[i]);

// Reverse traversal
for (int i = n - 1; i >= 0; i--)
    printf("%d ", arr[i]);
```

The pattern `i = 0` to `i < n` is the standard idiom for array traversal in C. Memorise it, and always use `<` rather than `<=` to avoid the off-by-one error.

---

### 2.5 Passing Arrays to Functions

Arrays in C are **always passed by reference** — what gets passed is a pointer to the first element, not a copy of the array. This means any modifications made inside the function affect the original array.

```c
// Printing an array
void printArray(int arr[], int n)
{
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    printf("\n");
}

// Finding the maximum element
int findMax(int arr[], int n)
{
    int max = arr[0];
    for (int i = 1; i < n; i++)
    {
        if (arr[i] > max)
            max = arr[i];
    }
    return max;
}

int main()
{
    int a[] = {3, 7, 1, 9, 4};
    printArray(a, 5);
    printf("Max = %d\n", findMax(a, 5));
    return 0;
}
```

Output:

```
3 7 1 9 4
Max = 9
```

Notice that `findMax` initialises `max` to `arr[0]` — not to `0`. If you initialise to `0` and all elements are negative, you will return the wrong answer. Start with an actual element from the array.

---

## 3. Multi-Dimensional Arrays

A 2D array is an array of arrays — it represents tabular data with rows and columns, and maps directly onto matrices, grids, and adjacency tables in graph algorithms.

---

### 3.1 Declaration and Initialisation

```c
int matrix[3][4];                       // 3 rows, 4 columns — garbage values
int mat[2][3] = {{1, 2, 3}, {4, 5, 6}}; // Fully initialised
```

Access follows the pattern `mat[row][col]`:

```c
printf("%d\n", mat[1][2]);   // Row 1, Column 2 → 6
```

---

### 3.2 Traversal with Nested Loops

```c
for (int i = 0; i < 2; i++)           // Iterate over rows
{
    for (int j = 0; j < 3; j++)       // Iterate over columns within each row
        printf("%d ", mat[i][j]);
    printf("\n");
}
```

The outer loop controls the row; the inner loop sweeps across all columns of that row. This is exactly the same logic you would use when implementing matrix multiplication or traversing an adjacency matrix.

---

### 3.3 Memory Layout — Row-Major Order

2D arrays in C are stored **row by row** in a single continuous block of memory:

```
mat[0][0], mat[0][1], mat[0][2], mat[1][0], mat[1][1], mat[1][2]
```

The second row immediately follows the first in memory. This has performance implications — traversing row by row (as in the loop above) is cache-friendly. Traversing column by column is not.

---

### 3.4 Passing 2D Arrays to Functions

When passing a 2D array to a function, you must specify the number of columns. The number of rows can be passed as a parameter. The column count must be fixed because C needs it to calculate memory offsets.

```c
void display(int mat[][3], int rows)
{
    for (int i = 0; i < rows; i++)
    {
        for (int j = 0; j < 3; j++)
            printf("%d ", mat[i][j]);
        printf("\n");
    }
}
```

---

## 4. Strings

In C, there is no dedicated string type. A **string is simply an array of `char` values, terminated by the null character `\0`**.

Every string operation — copying, comparing, searching — is just array manipulation with one special rule: stop when you encounter `\0`.

---

### 4.1 Declaration

```c
char name[10] = "Uday";    // Stored as: {'U','d','a','y','\0', ...}
char name[]   = "Uday";    // Size automatically set to 5 (4 chars + null)
```

The null terminator `\0` is not something you see — but it is always there, and every string function depends on it. If `\0` is missing or overwritten, string functions will read beyond the array boundary.

---

### 4.2 Reading Strings

```c
char name[50];
scanf("%s", name);          // Reads until whitespace — no & needed for arrays
fgets(name, 50, stdin);     // Reads full line including spaces — safer choice
```

`scanf("%s")` stops reading at the first space. If a user enters `"Uday Kumar"`, only `"Uday"` is stored. For full-line input, always prefer `fgets`.

---

### 4.3 Standard String Functions — `<string.h>`

```c
#include <string.h>

char s1[20] = "Hello";
char s2[20] = "World";

strlen(s1);           // Returns 5 — length, not counting \0
strcpy(s1, s2);       // Copies s2 into s1 → s1 becomes "World"
strcat(s1, s2);       // Appends s2 to s1 → s1 becomes "HelloWorld"
strcmp(s1, s2);       // Returns 0 if equal, negative if s1 < s2, positive if s1 > s2
strchr(s1, 'l');      // Returns pointer to first occurrence of 'l', or NULL
strstr(s1, "llo");    // Returns pointer to first occurrence of substring, or NULL
```

A common mistake with `strcmp`: it does not return `true` or `false`. It returns `0` when strings are equal. So the correct check is:

```c
if (strcmp(s1, s2) == 0)   // Correct — strings are equal
if (strcmp(s1, s2))        // Wrong — 0 means equal, which is false here
```

---

### 4.4 Traversing a String

```c
char str[] = "Hello";

// Method 1 — using null terminator as stopping condition
for (int i = 0; str[i] != '\0'; i++)
    printf("%c", str[i]);

// Method 2 — using strlen
int len = strlen(str);
for (int i = 0; i < len; i++)
    printf("%c", str[i]);
```

Method 1 is more idiomatic C — it does not require a separate call to `strlen` and works directly with the null terminator.

---

### 4.5 Reversing a String — A Classic DSA Pattern

```c
void reverseString(char str[])
{
    int left  = 0;
    int right = strlen(str) - 1;

    while (left < right)
    {
        char temp   = str[left];
        str[left]   = str[right];
        str[right]  = temp;
        left++;
        right--;
    }
}
```

This **two-pointer technique** — one pointer starting from each end, moving toward the centre — is not just a string trick. It is a fundamental pattern that appears in palindrome checking, partitioning in Quicksort, and numerous array manipulation problems. Understand the logic here, and you will recognise it immediately when it reappears in more complex contexts.

---

## Chapter Summary

|Concept|Key Point to Remember|
|---|---|
|Function prototype|Must appear before the first call; tells the compiler the function exists|
|`void` return type|Use when the function performs an action but returns nothing|
|Arrays passed by reference|Functions always receive a pointer — changes affect the original|
|Array indexing|Always `0` to `n-1`; accessing index `n` is undefined behaviour|
|Out-of-bounds access|C will not stop you — it silently corrupts memory|
|2D arrays in memory|Stored row-by-row (row-major order)|
|Column size in 2D params|Must always be specified when passing to a function|
|Strings end with `\0`|All string functions depend on this; losing it breaks everything|
|`strcmp` returns `0` for equal|Not `1` or `true` — a common source of logic errors|
|Two-pointer technique|The basis of string reversal, palindrome checks, and partition logic|

---

> **Your professor's observation:** Students who struggle with pointers later almost always have one gap in common — they never clearly understood that an array name _is_ an address, and that passing an array to a function means handing over that address. If that idea is still slightly fuzzy, re-read sections 2.3 and 2.5 before moving forward. Everything about pointers builds directly on that foundation.

---
