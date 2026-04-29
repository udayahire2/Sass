# C Programming — Chapter 4: Pointers

### _The Concept That Separates C Programmers from Everyone Else_

---

## Preface to This Chapter

Every student who has struggled with Linked Lists, Trees, or Dynamic Memory has the same root problem — they never truly understood pointers. They memorised the syntax, passed the exercise, and moved on. Then, when a node needed to be inserted into a linked list, or a function needed to modify a variable in the caller's scope, everything fell apart.

This chapter will not let that happen. Read it slowly. Trace every example by hand. The investment pays off for the entire remainder of your DSA course.

---

## 1. What a Pointer Actually Is

Before the syntax, the concept.

Every variable you declare is stored somewhere in your computer's RAM. That location has an **address** — a number that identifies exactly where in memory the variable lives. A pointer is simply a variable whose purpose is to **store one of these addresses**.

That is all it is. A variable that holds an address.

```c
int a = 5;
int *p = &a;     // p stores the memory address of a

printf("%d\n",  a);   // 5        → the value of a
printf("%p\n", &a);   // 0x...    → the memory address of a
printf("%p\n",  p);   // 0x...    → same address (p was assigned &a)
printf("%d\n", *p);   // 5        → the value sitting at that address
```

Read that last line carefully. `*p` does not mean "the value of p". It means **"go to the address stored in p, and retrieve what is there."** This operation is called **dereferencing**.

---

### 1.1 The Two Essential Operators

|Operator|Name|What It Does|
|---|---|---|
|`&`|Address-of|Returns the memory address of a variable|
|`*`|Dereference|Returns the value stored at a given address|

These two operators are inverses of each other. `&` moves you from a variable to its address. `*` moves you from an address back to the value.

```c
int x = 10;
int *ptr = &x;   // ptr now holds the address of x — let's say address 2000

*ptr = 50;       // Go to address 2000. Write 50 there.

printf("%d\n", x);   // 50 — x was modified through the pointer
```

You never touched `x` directly in the last assignment. You navigated to its location in memory and changed what was there. This indirect access is the entire power of pointers.

---

### 1.2 Declaring Pointers of Different Types

```c
int    *p;    // Pointer to an integer
char   *cp;   // Pointer to a character
float  *fp;   // Pointer to a float
double *dp;   // Pointer to a double
void   *vp;   // Generic pointer — can point to any type
int   **pp;   // Pointer to a pointer (used in 2D arrays, linked list of lists)
```

The type of a pointer matters because it determines **how many bytes are read when you dereference it**. An `int *` reads 4 bytes. A `char *` reads 1 byte. If the types mismatch, the data you retrieve is meaningless.

---

### 1.3 The NULL Pointer — Safety Against the Void

An uninitialised pointer contains a garbage address — a random number that happens to be sitting in memory. If you dereference it, you are reading or writing to some unknown location in memory. This is one of the most dangerous things you can do in C.

The safe default:

```c
int *p = NULL;    // p explicitly points to nothing

if (p == NULL)
    printf("Pointer is null — do not dereference.\n");
```

`NULL` is a defined constant representing address zero, which is guaranteed to be invalid. Checking for `NULL` before dereferencing is not optional caution — it is correct programming practice.

In Linked Lists, `NULL` plays a structural role: it marks the **end of the list**. When `head == NULL`, the list is empty. When `node->next == NULL`, you have reached the last node. You will write these checks hundreds of times.

---

### 1.4 Pointers and Arrays — The Relationship You Must Understand

In C, the name of an array is not just a name. It **is** the address of the first element.

```c
int arr[] = {10, 20, 30, 40, 50};
int *p = arr;       // No & needed — arr is already an address

printf("%d\n", *p);       // 10 → arr[0]
printf("%d\n", *(p + 1)); // 20 → arr[1]
printf("%d\n", *(p + 4)); // 50 → arr[4]
```

This is why, in the previous chapter, you could pass an array to a function without `&` — the array name was already providing an address. And this is why modifications inside the function affected the original array — the function was operating directly on the memory, not a copy.

Traversing an array through a pointer:

```c
for (int i = 0; i < 5; i++)
    printf("%d ", *(p + i));
```

This is functionally identical to `arr[i]`. In fact, `arr[i]` is simply C's syntactic shorthand for `*(arr + i)`. The compiler treats them as the same thing.

---

## 2. Pointer Arithmetic

Pointers support addition, subtraction, increment, and decrement. But the arithmetic does not operate in raw bytes — it operates in **units of the pointer's data type**.

When you increment an `int *`, it moves forward by `sizeof(int)` bytes, i.e., 4 bytes. When you increment a `char *`, it moves by 1 byte. The pointer always lands on the next valid element of its type.

```c
int arr[] = {10, 20, 30, 40, 50};
int *p = arr;       // p = address 1000

p++;                // p = 1004 (moved by sizeof(int) = 4 bytes)
printf("%d\n", *p); // 20

p += 2;             // p = 1012
printf("%d\n", *p); // 40

p--;                // p = 1008
printf("%d\n", *p); // 30
```

Visualised across memory:

```
Address:   1000    1004    1008    1012    1016
Value:       10      20      30      40      50
Pointer:     p     p+1     p+2     p+3     p+4
```

You can also **subtract two pointers** of the same type to find how many elements lie between them:

```c
int *p1 = &arr[1];
int *p2 = &arr[4];

printf("%ld\n", p2 - p1);   // 3 — there are 3 elements between them
```

This is not the difference in addresses (which would be 12). It is the difference in _element count_ — which is almost always what you actually want.

---

## 3. Call by Value vs. Call by Reference

This distinction is critical for DSA. Whether a function can modify the original data in the caller — or only a copy — determines whether your insert, delete, and swap operations actually work.

---

### 3.1 Call by Value — The Function Works on a Copy

```c
void tryChange(int x)
{
    x = 100;    // Modifies only the local copy — the original is untouched
}

int main()
{
    int a = 5;
    tryChange(a);
    printf("%d\n", a);   // Still 5
    return 0;
}
```

When you pass `a` to `tryChange`, C creates a _copy_ of the value `5` and gives that copy to the function. Whatever the function does to `x` has no effect on `a` in `main`. The two are entirely separate.

---

### 3.2 Call by Reference — The Function Works on the Original

```c
void actualChange(int *x)
{
    *x = 100;   // Goes to the address x holds, writes 100 there
}

int main()
{
    int a = 5;
    actualChange(&a);    // Pass the address of a — not the value
    printf("%d\n", a);   // 100 — original was modified
    return 0;
}
```

This time, the function receives the _address_ of `a`. Using `*x = 100`, it navigates to that address and modifies what is there directly. The variable `a` in `main` and the memory location pointed to by `x` inside the function are the same location.

---

### 3.3 The Swap Function — A Classic Demonstration

The swap function is the standard proof that call by reference works:

```c
void swap(int *a, int *b)
{
    int temp = *a;   // Save the value at address a
    *a = *b;         // Write value at address b into address a
    *b = temp;       // Write saved value into address b
}

int main()
{
    int x = 10, y = 20;
    swap(&x, &y);
    printf("x = %d, y = %d\n", x, y);   // x = 20, y = 10
    return 0;
}
```

Trace this step by step. At no point are `x` and `y` themselves inside the swap function — only their addresses. Every operation happens through dereferencing. When `swap` returns, the values at those addresses have been exchanged.

If you try to write this without pointers — passing `x` and `y` directly — the function will swap its local copies, return, and `x` and `y` in `main` will be completely unchanged. This is one of the most important things to verify in your own understanding.

---

### 3.4 Why This Matters Enormously in DSA

Every meaningful operation on a Linked List requires modifying pointers — the `next` field of a node, the `head` pointer of the list, or both. If you pass these by value, your insertions and deletions will appear to work inside the function and then vanish the moment the function returns.

```c
// Inserting into a linked list — head must be a pointer to a pointer
void insertAtFront(Node **head, int data);

// Deleting a node — must be able to update the calling function's pointer
void deleteNode(Node **head, int key);
```

The `**head` — a pointer to a pointer — appears because even the pointer to the list's first node must be modifiable. You will encounter this pattern immediately when Linked Lists begin. Understanding it now removes all the confusion later.

---

## Chapter Summary

|Concept|What You Must Know|
|---|---|
|Pointer|A variable that stores a memory address, nothing more|
|`&` operator|Gives you the address of a variable|
|`*` operator|Gives you the value at an address (dereferencing)|
|NULL pointer|A safe default; always initialise pointers to NULL|
|Array name|Already an address — no `&` needed|
|`*(p + i)`|Equivalent to `arr[i]` — the compiler treats them identically|
|Pointer arithmetic|Moves in units of the data type size, not raw bytes|
|Pointer subtraction|Returns number of elements between two pointers|
|Call by value|Function gets a copy — original is never modified|
|Call by reference|Function gets the address — original is modified directly|
|`**` pointer|Pointer to a pointer — essential for linked list operations|

---

> **Your professor's note:** The moment pointers become intuitive is the moment C becomes intuitive. That moment comes not from reading, but from tracing — drawing boxes for variables, arrows for pointers, and following each operation step by step on paper. Do this for every example in this chapter before moving on. When you can trace a swap or an array traversal through pointer arithmetic without hesitation, you are ready for Linked Lists.

---
