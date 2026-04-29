# C Programming — Chapter 5: Memory & Custom Types

### _How Nodes Are Born, and What They Look Like_

---

## Preface to This Chapter

You now understand pointers — you know that a pointer holds an address, and that dereferencing it gives you the value at that address. This chapter takes that knowledge and puts it to work in two essential directions.

First, **dynamic memory allocation** — the mechanism by which memory is requested at runtime, from a region called the Heap. This is precisely how every Linked List node, every tree node, and every dynamically-sized structure in DSA is created.

Second, **structures** — the way C lets you group related data of different types under a single name. The Linked List node you will write in the next chapter is a structure. So is every tree node, every graph vertex, and every record in a real system.

Master both of these, and you will have everything you need to build data structures from scratch.

---

## 1. Dynamic Memory Allocation

So far, every array and variable you have declared has been **statically allocated** — its size was fixed at compile time, and memory for it was automatically managed on the **Stack**. The Stack is fast and self-cleaning, but it has two significant limitations: its size is fixed, and it cannot outlive the function that created it.

**Dynamic memory allocation** solves both problems. Memory is requested at runtime from a separate region called the **Heap**, and it persists until you explicitly release it. You control when it is created and when it is destroyed.

All dynamic allocation functions live in `<stdlib.h>`.

---

### 1.1 The Memory Map — Knowing Where Things Live

Before the functions, understand the layout of memory during a C program's execution:

```
┌─────────────────────┐
│        Stack        │  ← Local variables, function calls (auto-managed)
├─────────────────────┤
│          ↓          │  Stack grows downward
│                     │
│          ↑          │  Heap grows upward
├─────────────────────┤
│        Heap         │  ← malloc / calloc / realloc (you manage this)
├─────────────────────┤
│         BSS         │  ← Uninitialised global variables
├─────────────────────┤
│        Data         │  ← Initialised global variables
├─────────────────────┤
│        Text         │  ← Your compiled code (read-only)
└─────────────────────┘
```

Everything you allocate with `malloc` and its relatives lives in the Heap. The OS does not clean it up when a function ends. Only you can clean it up — with `free`.

---

### 1.2 `malloc()` — Allocate a Block of Memory

`malloc` (Memory Allocate) requests a specified number of bytes from the Heap and returns a pointer to the start of that block. The memory is **not initialised** — it contains whatever bits happened to be there previously.

```c
#include <stdlib.h>

int *p = (int *) malloc(sizeof(int));   // Request 4 bytes; cast to int*

if (p == NULL)
{
    printf("Allocation failed\n");      // Always check — malloc can fail
    return 1;
}

*p = 42;
printf("%d\n", *p);   // 42

free(p);              // Release the memory back to the OS
p = NULL;             // Prevent accidental use of freed memory
```

Two rules to adopt permanently: **always check** that `malloc` did not return `NULL` before using the pointer, and **always `free`** what you allocate.

The `sizeof` operator is critical here. Never hardcode byte counts — `sizeof(int)` gives you the correct size on any platform.

---

### 1.3 `calloc()` — Allocate and Initialise to Zero

`calloc` (Cleared Allocate) takes two arguments — the number of elements and the size of each — and returns a zeroed block of memory. It is `malloc` with the added guarantee that every byte is `0`.

```c
int *arr = (int *) calloc(5, sizeof(int));   // 5 integers, all initialised to 0

for (int i = 0; i < 5; i++)
    printf("%d ", arr[i]);   // 0 0 0 0 0

free(arr);
```

Use `calloc` when you need a clean starting state — initialised arrays, zeroed buffers, or any structure where uninitialised values would cause incorrect behaviour.

---

### 1.4 `realloc()` — Resize an Existing Allocation

`realloc` resizes a previously allocated block. It may expand it in place, or it may allocate a new block, copy the existing data, and free the old one — all transparently.

```c
int *arr = (int *) malloc(3 * sizeof(int));
arr[0] = 1;  arr[1] = 2;  arr[2] = 3;

// Expand to hold 5 integers
arr = (int *) realloc(arr, 5 * sizeof(int));
arr[3] = 4;  arr[4] = 5;

free(arr);
```

**Important:** Always assign the result of `realloc` to a temporary pointer first. If `realloc` fails, it returns `NULL` — and if you assigned directly to `arr`, you have lost your only reference to the original block, causing a memory leak.

```c
int *temp = (int *) realloc(arr, 5 * sizeof(int));
if (temp == NULL)
{
    // arr is still valid — handle the error
    free(arr);
    return 1;
}
arr = temp;
```

---

### 1.5 Runtime-Sized Arrays — The DSA Use Case

This is where dynamic allocation becomes immediately practical. In DSA, you often do not know the size of an array until the user provides it at runtime.

```c
int n;
printf("Enter size: ");
scanf("%d", &n);

int *arr = (int *) malloc(n * sizeof(int));

for (int i = 0; i < n; i++)
    scanf("%d", &arr[i]);

// Use the array for searching, sorting, etc.

free(arr);   // Mandatory
arr = NULL;
```

A statically declared array like `int arr[100]` forces you to choose a maximum size upfront — wasteful if the user enters 5, insufficient if they enter 200. Dynamic allocation gives you exactly the memory you need, when you need it.

---

### 1.6 Memory Leaks — The Silent Failure

A memory leak occurs when you allocate memory on the Heap but never `free` it. The memory remains reserved for your program even after the function that allocated it has returned — and there is no longer any pointer to reach it.

```c
void leak()
{
    int *p = (int *) malloc(sizeof(int));
    *p = 99;
    // No free(p) — this memory is now permanently lost
}
```

In a small program, this is harmless. In a DSA program that inserts thousands of nodes into a linked list and never deletes them properly, memory leaks cause steadily increasing memory consumption — eventually slowing or crashing the program. Every `malloc` must have a corresponding `free`.

---

## 2. Structures

A structure is a **user-defined type that groups variables of different types under a single name**. This is the mechanism C provides for modelling real-world entities — and more importantly for our purposes, for defining the nodes that make up every data structure.

---

### 2.1 Defining and Using a Basic Structure

```c
struct Student
{
    int   id;
    char  name[50];
    float gpa;
};

int main()
{
    struct Student s1;          // Declare a variable of type Student
    s1.id  = 101;               // Access members with the dot operator
    s1.gpa = 9.2;
    strcpy(s1.name, "Rahul");   // Strings must be copied, not assigned directly

    printf("%d %s %.1f\n", s1.id, s1.name, s1.gpa);

    // Inline initialisation — members assigned in declaration order
    struct Student s2 = {102, "Priya", 8.7};

    return 0;
}
```

The **dot operator** (`.`) accesses a member of a structure variable directly. Think of it as: _"from this structure, give me this member."_

---

### 2.2 Pointer to a Structure — The Arrow Operator

When you have a _pointer_ to a structure, accessing members through the dot operator requires you to dereference first:

```c
struct Student s   = {101, "Aryan", 9.5};
struct Student *ptr = &s;

printf("%d\n", (*ptr).id);   // Dereference first, then access — correct but verbose
printf("%d\n",  ptr->id);    // Arrow operator — identical meaning, cleaner syntax
printf("%s\n",  ptr->name);
```

The **arrow operator** (`->`) is simply shorthand for dereference-then-access. In every DSA implementation you write — linked lists, trees, graphs — you will use `->` constantly, because you will almost always be working through pointers to nodes. Get comfortable with it now.

---

### 2.3 The Linked List Node — Your First Self-Referential Structure

```c
struct Node
{
    int          data;    // The value this node stores
    struct Node *next;    // Pointer to the next node in the chain
};
```

This structure references itself — `next` is a pointer to another `struct Node`. This is called a **self-referential structure**, and it is the fundamental building block of every linked list, tree, and graph you will implement.

When `next == NULL`, the node is the last in the chain. When `head == NULL`, the list is empty. These two facts are the entire basis of linked list logic.

---

### 2.4 Creating a Node Dynamically

Static node creation is useless in practice — you need to create nodes at runtime as data arrives. The standard pattern:

```c
struct Node* createNode(int value)
{
    struct Node *newNode = (struct Node *) malloc(sizeof(struct Node));

    if (newNode == NULL)
    {
        printf("Memory allocation failed\n");
        return NULL;
    }

    newNode->data = value;
    newNode->next = NULL;

    return newNode;
}
```

This function encapsulates the entire process of bringing a node into existence: allocate memory on the Heap, set its data, set its `next` to `NULL` (it points nowhere yet), and return a pointer to it. You will call this function — or one very similar — in every linked list operation you write.

---

### 2.5 Array of Structures

Structures can be collected into arrays just like any other type:

```c
struct Student class[30];    // An array of 30 Student structures

for (int i = 0; i < 30; i++)
    scanf("%d %s %f", &class[i].id, class[i].name, &class[i].gpa);
```

Note that `class[i].name` does not need `&` — it is a character array, and as established in the previous chapter, an array name is already an address.

---

### 2.6 Nested Structures

A structure can contain another structure as a member:

```c
struct Date
{
    int day, month, year;
};

struct Employee
{
    int        id;
    char       name[50];
    struct Date joinDate;    // A complete Date structure embedded inside Employee
};

struct Employee e;
e.joinDate.day   = 15;
e.joinDate.month = 8;
e.joinDate.year  = 2023;
```

Access follows the chain of dot operators: `e.joinDate.day` means — from `e`, get `joinDate`, then from that, get `day`.

---

## 3. Unions

A union looks syntactically similar to a structure, but it works fundamentally differently. All members of a union **share the same block of memory**. The union is only as large as its largest member, and only one member can hold a meaningful value at any given time.

```c
union Data
{
    int   i;
    float f;
    char  c;
};

int main()
{
    union Data d;

    d.i = 10;
    printf("%d\n",   d.i);   // 10

    d.f = 3.14;              // Overwrites the same memory location
    printf("%.2f\n", d.f);   // 3.14
    printf("%d\n",   d.i);   // Garbage — the bytes now encode a float, not an int
}
```

The contrast with structures is important:

||`struct`|`union`|
|---|---|---|
|Memory|Sum of all member sizes|Size of the largest member only|
|Members|All coexist simultaneously|Only one is valid at a time|
|DSA relevance|Node definitions, all data structures|Rarely used directly|

Unions are a memory optimisation tool for situations where a variable needs to hold one of several possible types — but never more than one simultaneously.

---

## 4. Enumerations (`enum`)

An enumeration assigns meaningful names to a sequence of integer constants. It does not create a new data type in any deep sense — it simply makes code more readable by replacing magic numbers with descriptive labels.

```c
enum Direction { NORTH = 0, SOUTH = 1, EAST = 2, WEST = 3 };
enum Color     { RED, GREEN, BLUE };   // Automatically assigned 0, 1, 2
```

If you do not specify values, the compiler assigns them starting from `0` and incrementing by `1`.

```c
int main()
{
    enum Direction d = NORTH;

    if (d == NORTH)
        printf("Going North\n");
}
```

---

### 4.1 Where Enums Appear in DSA — Graph Traversal

The most significant DSA application of enums is in graph algorithms. DFS and BFS need to track the state of each node during traversal. The standard convention uses three colours:

```c
enum Color { WHITE, GRAY, BLACK };
// WHITE = 0 → not yet visited
// GRAY  = 1 → currently being processed
// BLACK = 2 → fully processed

enum Color visited[100];

visited[0] = WHITE;    // Node 0: not yet visited
visited[1] = GRAY;     // Node 1: currently in stack/queue
visited[2] = BLACK;    // Node 2: fully processed
```

Without enum, you would write `0`, `1`, and `2` throughout your code — numbers that carry no meaning to anyone reading it. With enum, the intent is immediately clear.

---

## Chapter Summary

|Concept|What You Must Know|
|---|---|
|`malloc`|Allocates uninitialized memory on the Heap; returns NULL on failure|
|`calloc`|Allocates zeroed memory; takes count and size as separate arguments|
|`realloc`|Resizes an existing allocation; assign to a temp pointer first|
|`free`|Every `malloc` must have a `free`; forgetting causes memory leaks|
|`p = NULL` after `free`|Prevents accidental use of freed memory|
|Dot operator `.`|Accesses struct members through a variable directly|
|Arrow operator `->`|Accesses struct members through a pointer; used everywhere in DSA|
|Self-referential struct|A struct with a pointer to its own type — the basis of all linked structures|
|`createNode` pattern|Allocate with `malloc`, set data, set `next = NULL`, return pointer|
|`union`|All members share one memory location; only one valid at a time|
|`enum`|Named integer constants; makes graph traversal state tracking readable|

---

> **Your professor's note:** You now have every primitive you need. A structure defines the shape of a node. `malloc` creates it on the Heap. A pointer holds its address. The arrow operator reads its fields. And `free` destroys it when it is no longer needed. These four things — structure, malloc, pointer, free — are the complete toolkit for building Linked Lists, Trees, and Graphs. The next chapter puts them all together for the first time.

---
