# CS401 — Data Structures & Algorithms

# Unit I: Introduction to Data Structures

### _The Foundation of Everything That Follows_

> **Syllabus Coverage:** Basic Terminology · Classification · Operations · Linear Arrays · Pointers & Structures · Static & Dynamic Memory Management **Lectures:** 08 Hours | **Marks:** 12

---

## Preface to This Unit

Before you write a single algorithm, you must understand what you are organising and why organisation matters. A computer program without thoughtful data organisation is like a library where books are piled randomly on the floor — the information exists, but retrieving it is painfully slow and error-prone.

This unit builds the conceptual vocabulary you will use for the entire course. The terminology introduced here is not formality — it is the shared language of every data structures textbook, every technical interview, and every professional codebase you will encounter.

---

## 1. Basic Terminology

### 1.1 Data

**Data** is a raw, unprocessed fact or value. On its own, it carries no meaning.

The number `85`, the character `'A'`, the value `3.14` — these are data. They exist, but without context, they tell you nothing.

Data becomes meaningful only when it is given **context** — when you know that `85` is a student's exam score, that `'A'` is their grade, that `3.14` is an approximation of π. That context is what transforms raw data into **information**.

In C, every value your program works with — integers, characters, floating-point numbers — is data.

---

### 1.2 Data Item

A **data item** is a single unit of data that has a name and a value — in other words, a variable.

```c
int   marks = 85;    // 'marks' is a data item — name + value
char  grade = 'A';   // 'grade' is a data item
float gpa   = 9.2;   // 'gpa'   is a data item
```

Data items are classified into two kinds:

**Elementary (Atomic) Data Items** — items that cannot be meaningfully divided further. An integer, a single character, a floating-point number. These are the atoms of your data.

**Group Data Items** — items composed of multiple elementary items. A student's record, for instance, is a group data item — it contains `id`, `name`, `marks`, and `gpa` together.

```c
// This entire structure is one group data item
struct Student
{
    int   id;
    char  name[50];
    float gpa;
};
```

---

### 1.3 Data Type

A **data type** defines three things simultaneously:

- The **kind of values** a variable can hold
- The **amount of memory** it occupies
- The **operations** that are valid on it

In C, data types fall into two broad categories:

**Primitive (Built-in) Data Types** — provided directly by the language:

|Data Type|Values It Holds|Memory|
|---|---|---|
|`int`|Whole numbers|4 bytes|
|`float`|Decimal numbers (single precision)|4 bytes|
|`double`|Decimal numbers (double precision)|8 bytes|
|`char`|Single characters|1 byte|

**Derived / User-Defined Data Types** — constructed from primitives:

```c
int arr[10];        // Array     — derived type
struct Student s;   // Structure — user-defined type
int *p;             // Pointer   — derived type
```

The data type is not just a label — it tells the compiler how many bytes to allocate and which machine instructions are valid for that memory.

---

### 1.4 Data Structure

A **data structure** is an organised arrangement of data in memory, together with the set of operations that can be performed on that arrangement.

The keyword here is _organised_. A data structure is not just a collection of values — it is a collection with a **deliberate structure** that makes certain operations efficient.

Consider three ways to store ten student records:

- Scattered in ten separate variables → finding any one requires checking all ten one by one
- Stored in an array → finding by index is instant; searching requires scanning
- Stored in a sorted array → binary search finds any record in at most 4 comparisons

The data is the same in all three cases. The _structure_ is different — and the structure determines performance.

> **The fundamental goal of data structures:** Choose an organisation of data such that the operations you perform most frequently are as efficient as possible.

---

## 2. Classification of Data Structures

Data structures are classified along two primary axes: whether they are built into the language or user-defined, and whether elements are sequential or non-sequential.

```
Data Structures
│
├── Primitive (Basic)
│     int, float, char, double, pointer
│
└── Non-Primitive
      │
      ├── Linear
      │     Arrays, Linked Lists, Stacks, Queues
      │
      └── Non-Linear
            Trees, Graphs
```

---

### 2.1 Primitive Data Structures

These are the basic data types provided directly by the programming language. They are the building blocks from which all other data structures are constructed — `int`, `float`, `char`, `double`, and `pointer`.

---

### 2.2 Non-Primitive Data Structures

These are data structures constructed from primitive types.

**Linear Data Structures** — elements are arranged sequentially, one after another. Each element has a unique predecessor (except the first) and a unique successor (except the last).

|Structure|Organisation|Access Pattern|
|---|---|---|
|Array|Contiguous memory, fixed size|Random access by index — O(1)|
|Linked List|Nodes connected by pointers|Sequential access — O(n)|
|Stack|Linear, restricted to one end|Last In, First Out — LIFO|
|Queue|Linear, restricted to two ends|First In, First Out — FIFO|

**Non-Linear Data Structures** — elements are arranged hierarchically or in an interconnected network. An element may have multiple predecessors and successors.

|Structure|Organisation|Primary Use|
|---|---|---|
|Tree|Hierarchical (parent → children)|Searching, sorting, file systems|
|Graph|Network (nodes connected by edges)|Maps, social networks, routing|

---

### 2.3 Static vs. Dynamic Data Structures

**Static Data Structures** — size is fixed at compile time. Memory allocated on the Stack. Fast, but inflexible.

```c
int arr[100];   // Fixed — always occupies space for 100 integers
```

**Dynamic Data Structures** — size grows and shrinks at runtime. Memory allocated on the Heap. Flexible, but requires careful management.

```c
int *arr = (int *) malloc(n * sizeof(int));  // Size decided at runtime
```

---

## 3. Operations on Data Structures

Every data structure supports a standard set of operations. Understanding these operations — and their cost — is what data structures study is fundamentally about.

|Operation|What It Does|
|---|---|
|**Traversal**|Visit every element exactly once to process it|
|**Insertion**|Add a new element at a specified position|
|**Deletion**|Remove an element from a specified position|
|**Searching**|Find the location of an element with a given value|
|**Sorting**|Arrange elements in a defined order (ascending / descending)|
|**Merging**|Combine two data structures into one|

> Not all operations are equally efficient on all data structures. The choice of data structure is always the choice of which operations you need to be fast.

---

## 4. Linear Arrays

An **array** is a finite, ordered collection of homogeneous elements stored in **contiguous memory locations**, accessible by a numeric index.

Every element occupies the same amount of memory, and every element's address can be computed directly from the base address and the index. This is what makes array access O(1) — constant time, regardless of size.

---

### 4.1 Memory Representation

For an array `A` of type `int` with base address `B` and starting index `0`:

```
Address of A[i] = B + (i × sizeof(int))
```

Visually:

```
int arr[5] = {10, 20, 30, 40, 50}

Index:       [0]    [1]    [2]    [3]    [4]
Value:        10     20     30     40     50
Address:    1000   1004   1008   1012   1016
```

The address formula is the reason arrays are so fast — the CPU does not search for an element, it **calculates** its location directly.

---

### 4.2 Declaration and Initialisation

```c
int arr[5];                         // Declaration — garbage values
int arr[5] = {10, 20, 30, 40, 50}; // Fully initialised
int arr[]  = {1, 2, 3, 4, 5};      // Size inferred automatically (= 5)
int arr[5] = {0};                   // All elements set to zero
int arr[5] = {1, 2};               // First two set; remaining default to 0
```

---

### 4.3 Operation 1 — Traversal

**Traversal** means visiting every element of the array exactly once, in order, and performing some operation on each.

```c
#include <stdio.h>

void traverse(int arr[], int n)
{
    printf("Array elements: ");
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    printf("\n");
}

int main()
{
    int arr[] = {10, 20, 30, 40, 50};
    int n = 5;
    traverse(arr, n);   // Output: 10 20 30 40 50
    return 0;
}
```

**Algorithm:**

```
Step 1: Set i = 0
Step 2: While i < n, do:
          Process arr[i]
          i = i + 1
Step 3: Stop
```

**Time Complexity:** O(n) — every element is visited once. **Space Complexity:** O(1) — no extra memory used.

---

### 4.4 Operation 2 — Insertion

**Insertion** means placing a new element at a given position. Since arrays are contiguous in memory, you must **shift every element at and after the insertion point one position to the right**, then place the new value.

```c
void insert(int arr[], int *n, int element, int position)
{
    // Shift elements from end down to 'position' one place right
    for (int i = *n - 1; i >= position; i--)
        arr[i + 1] = arr[i];

    arr[position] = element;   // Place the new element
    (*n)++;                    // Increase the logical size
}

int main()
{
    int arr[10] = {10, 20, 30, 40, 50};
    int n = 5;

    insert(arr, &n, 25, 2);   // Insert 25 at position 2

    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    // Output: 10 20 25 30 40 50
    return 0;
}
```

**Trace — Inserting 25 at position 2:**

```
Before:   [10] [20] [30] [40] [50] [ ]
                     ↑
              Insert 25 here (index 2)

Step 1 — Shift arr[4] → arr[5]:   [10] [20] [30] [40] [50] [50]
Step 2 — Shift arr[3] → arr[4]:   [10] [20] [30] [40] [40] [50]
Step 3 — Shift arr[2] → arr[3]:   [10] [20] [30] [30] [40] [50]
Step 4 — Place 25 at arr[2]:      [10] [20] [25] [30] [40] [50]
Step 5 — n = 6
```

**Algorithm:**

```
Step 1: If n = MAX, print "Overflow" and stop
Step 2: Set i = n - 1
Step 3: While i >= position, do:
          arr[i+1] = arr[i]
          i = i - 1
Step 4: arr[position] = element
Step 5: n = n + 1
Step 6: Stop
```

**Time Complexity:**

- Best case — insert at end: **O(1)** (no shifting needed)
- Worst case — insert at beginning: **O(n)** (all elements shift)
- Average case: **O(n)**

**Space Complexity:** O(1)

> **Critical constraint:** The physical array must have enough pre-allocated space to hold one more element. Array insertion does not create memory — it uses existing space.

---

### 4.5 Operation 3 — Deletion

**Deletion** means removing an element from a given position. The element is removed by **shifting all elements after it one position to the left**, overwriting the deleted element.

```c
void delete(int arr[], int *n, int position)
{
    // Shift all elements after 'position' one place left
    for (int i = position; i < *n - 1; i++)
        arr[i] = arr[i + 1];

    (*n)--;    // Reduce the logical size
}

int main()
{
    int arr[] = {10, 20, 30, 40, 50};
    int n = 5;

    delete(arr, &n, 2);   // Delete element at position 2 (value = 30)

    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    // Output: 10 20 40 50
    return 0;
}
```

**Trace — Deleting element at position 2 (value 30):**

```
Before:   [10] [20] [30] [40] [50]
                     ↑
              Delete position 2

Step 1 — arr[2] = arr[3]:   [10] [20] [40] [40] [50]
Step 2 — arr[3] = arr[4]:   [10] [20] [40] [50] [50]
Step 3 — n-- → n = 4:       [10] [20] [40] [50]
```

> `arr[4]` still holds `50` in physical memory — but since `n = 4`, it is logically outside the array and will be overwritten on the next insertion.

**Algorithm:**

```
Step 1: If n = 0, print "Underflow" and stop
Step 2: Set i = position
Step 3: While i < n - 1, do:
          arr[i] = arr[i+1]
          i = i + 1
Step 4: n = n - 1
Step 5: Stop
```

**Time Complexity:**

- Best case — delete from end: **O(1)** (no shifting)
- Worst case — delete from beginning: **O(n)** (all elements shift)
- Average case: **O(n)**

**Space Complexity:** O(1)

---

### 4.6 Searching in an Array

**Linear Search** — check each element one by one until the target is found or the array is exhausted. Works on any array (sorted or unsorted).

```c
int linearSearch(int arr[], int n, int target)
{
    for (int i = 0; i < n; i++)
    {
        if (arr[i] == target)
            return i;    // Return index of found element
    }
    return -1;           // Not found
}
```

**Time Complexity:** O(n)

**Binary Search** — works only on a **sorted** array. Compares the target with the middle element and eliminates half the search space each step.

```c
int binarySearch(int arr[], int left, int right, int target)
{
    while (left <= right)
    {
        int mid = left + (right - left) / 2;  // Safe mid calculation

        if      (arr[mid] == target) return mid;
        else if (arr[mid] <  target) left  = mid + 1;
        else                         right = mid - 1;
    }
    return -1;  // Not found
}
```

**Time Complexity:** O(log n)

|Search|Requirement|Time Complexity|
|---|---|---|
|Linear Search|Any array|O(n)|
|Binary Search|Sorted array only|O(log n)|

---

## 5. Pointers and Structures in the Context of Data Structures

### 5.1 Why Pointers Are the Core of Dynamic Data Structures

An array's greatest limitation is its fixed size. Once declared, it cannot grow. Pointers break this limitation entirely — by storing addresses and using `malloc`, you can build structures that **grow and shrink dynamically** at runtime.

```c
// A node that can be created at any time, in any quantity
struct Node
{
    int          data;
    struct Node *next;   // Pointer to next node — links nodes together
};

// Creating a node on demand
struct Node* createNode(int value)
{
    struct Node *n = (struct Node *) malloc(sizeof(struct Node));
    n->data = value;
    n->next = NULL;      // Points nowhere yet
    return n;
}
```

The `next` pointer is what makes a linked list a _list_ rather than an isolated node. Through this address, nodes anywhere in memory are logically connected into a sequence.

---

### 5.2 Structures as the Blueprint for Data Structure Nodes

Every non-primitive data structure is built from nodes — and every node is a structure. The structure defines what data each node holds and how it connects to its neighbours.

```c
// Linked List node — one pointer
typedef struct Node
{
    int          data;
    struct Node *next;
} Node;

// Binary Tree node — two pointers
typedef struct TreeNode
{
    int              data;
    struct TreeNode *left;
    struct TreeNode *right;
} TreeNode;

// Graph adjacency list node
typedef struct GraphNode
{
    int              vertex;
    struct GraphNode *next;
} GraphNode;
```

The shape changes — one pointer, two pointers, additional fields — but the principle is always the same: a structure bundles the data and the connections into a single logical unit.

---

### 5.3 The Arrow Operator `->` — Used Everywhere in DSA

When working through a pointer to a structure, use `->` to access members:

```c
Node *p = createNode(10);

p->data = 10;       // Access member through pointer
p->next = NULL;

// Equivalent but verbose:
(*p).data = 10;
```

In every linked list, tree, and graph implementation you write, `->` will appear constantly. It is the syntax of DSA in C.

---

## 6. Static and Dynamic Memory Management

The choice between static and dynamic memory is not a technical detail — it determines the fundamental capabilities of your data structure.

---

### 6.1 The Memory Map

```
┌─────────────────────┐  High Address
│        Stack        │  ← Local variables, function calls (auto-managed)
├─────────────────────┤
│          ↓          │  Stack grows downward
│                     │
│          ↑          │  Heap grows upward
├─────────────────────┤
│        Heap         │  ← malloc / calloc / realloc  (you manage this)
├─────────────────────┤
│         BSS         │  ← Uninitialised global variables
├─────────────────────┤
│        Data         │  ← Initialised global variables
├─────────────────────┤
│        Text         │  ← Your compiled code (read-only)
└─────────────────────┘  Low Address
```

---

### 6.2 Static Memory Management

Memory allocated at **compile time**, on the **Stack**, with fixed size.

```c
int arr[100];            // Always 400 bytes, whether you use 3 or 100 elements
struct Student s[50];    // Always space for 50 students
```

|Property|Behaviour|
|---|---|
|Allocation time|Compile time|
|Location|Stack|
|Size|Fixed — cannot change at runtime|
|Management|Automatic — freed when function returns|
|Speed|Fast|
|Flexibility|None|

**The critical limitation:** If you declare `int arr[100]` and the user needs 200 elements — there is nothing you can do. The array cannot grow.

---

### 6.3 Dynamic Memory Management

Memory allocated at **runtime**, from the **Heap**, in exactly the quantity needed.

```c
int n;
scanf("%d", &n);

int *arr = (int *) malloc(n * sizeof(int));  // Exactly n integers

// ... use the array ...

free(arr);    // Return memory to the OS
arr = NULL;   // Prevent dangling pointer
```

|Property|Behaviour|
|---|---|
|Allocation time|Runtime|
|Location|Heap|
|Size|Flexible — grows and shrinks|
|Management|Manual — you must call `free`|
|Speed|Slightly slower|
|Flexibility|Complete|

---

### 6.4 The Four Dynamic Memory Functions

**`malloc(size)`** — allocates `size` bytes. Contents uninitialised.

```c
int *p = (int *) malloc(sizeof(int));
if (p == NULL) { /* handle failure */ }
```

**`calloc(count, size)`** — allocates `count × size` bytes, all initialised to zero.

```c
int *arr = (int *) calloc(n, sizeof(int));   // All zeros
```

**`realloc(ptr, new_size)`** — resizes an existing allocation.

```c
int *temp = (int *) realloc(arr, new_n * sizeof(int));
if (temp != NULL) arr = temp;
```

**`free(ptr)`** — releases memory back to OS.

```c
free(arr);
arr = NULL;   // Set to NULL immediately after freeing
```

---

### 6.5 Memory Leak — The Silent Failure

```c
void leak()
{
    int *p = (int *) malloc(100 * sizeof(int));
    // ... use p ...
    // forgot free(p) — 400 bytes permanently lost
}
```

Call this function a thousand times → 400,000 bytes lost permanently. In a DSA program building thousands of linked list nodes without ever freeing them, memory leaks cause steadily increasing consumption, slowdown, and eventual crash.

**Rule:** Every `malloc` must have a corresponding `free`.

---

### 6.6 Static vs. Dynamic — Direct Comparison

|Criterion|Static (Stack)|Dynamic (Heap)|
|---|---|---|
|Allocation time|Compile time|Runtime|
|Size|Fixed|Variable|
|Management|Automatic|Manual (`malloc` / `free`)|
|Overflow risk|Stack overflow if too large|Memory leak if not freed|
|Speed|Faster|Slightly slower|
|Use case|Known, fixed-size data|Unknown or variable-size data|
|DSA relevance|Simple arrays, fixed buffers|Linked lists, trees, graphs|

---

## Unit I — Complete Summary

|Topic|Core Concept|
|---|---|
|Data|Raw facts — values without context|
|Data Item|Named variable — elementary (atomic) or group|
|Data Type|Defines valid values, memory size, and valid operations|
|Data Structure|Organised data + operations; organisation determines efficiency|
|Linear structures|Sequential — arrays, linked lists, stacks, queues|
|Non-linear structures|Hierarchical or networked — trees, graphs|
|Traversal|Visit every element once — O(n)|
|Insertion in array|Shift right, place element — O(n) worst case|
|Deletion in array|Shift left, reduce size — O(n) worst case|
|Linear Search|O(n) — works on unsorted arrays|
|Binary Search|O(log n) — requires sorted array|
|Static memory|Fixed size, Stack, automatic — fast but inflexible|
|Dynamic memory|Variable size, Heap, manual — flexible but requires `free`|
|Pointer role|Enables dynamic structures by storing and linking addresses|
|Structure role|Defines the shape and connections of every DSA node|

---

> **Professor's Note before Unit II:** The concepts in this unit are not background reading — they are load-bearing walls. When you implement a stack and ask _"should I use an array or a linked list?"_, you are applying what this unit taught. When you ask _"why is my insertion O(n)?"_, you are applying this unit. When you design a node structure for a linked list, you are applying this unit. Every decision in the units that follow traces directly back to the vocabulary and principles established here.

---

_Next: Unit II → Stacks and Queues_