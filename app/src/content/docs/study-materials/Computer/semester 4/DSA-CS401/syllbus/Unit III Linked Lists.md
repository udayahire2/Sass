# CS401 — Data Structures & Algorithms

# Unit III: Linked Lists

### _Dynamic Structures Built Node by Node_

> **Syllabus Coverage:** Concept of Linked Organisation · Memory Representation · Singly, Doubly & Circular Linked Lists · Creation, Traversal, Search, Insertion, Deletion · Stack & Queue using Linked List **Lectures:** 08 Hours | **Marks:** 12

---

## Preface to This Unit

In the previous unit, every data structure — the stack and the queue — was built on top of an array. And every array shares the same fundamental constraint: **its size is fixed at compile time**. If you need more space, you cannot have it. If you allocate too much, you waste it.

The **Linked List** breaks this constraint entirely. It does not allocate a block of memory upfront and fill it in. Instead, it creates each element individually — exactly when needed, exactly the size required — and connects them together through pointers.

This is the concept of **linked organisation**: rather than storing elements in adjacent memory locations, you store them anywhere in memory and connect them through addresses. The structure exists not in the physical layout of memory, but in the logical chain of pointers.

This unit is where every C concept you have studied — structures, pointers, `malloc`, `free`, the arrow operator — comes together to build something real.

---

## 1. Concept of Linked Organisation

### 1.1 The Problem with Arrays

Consider what happens when you insert an element at the beginning of an array with 10,000 elements. Every single element must shift one position to the right — 10,000 operations for a single insertion. Deletion from the front has the same cost.

Furthermore, arrays require contiguous memory. If you need space for 1,000 integers, the system must find 4,000 consecutive bytes. As memory becomes fragmented over time, this contiguous block may simply not be available — even if 4,000 bytes of free memory exist scattered across RAM.

### 1.2 The Linked Organisation Solution

In a linked list, each element — called a **node** — stores two things:

1. The **data** (the actual value)
2. A **pointer** to the next node

Nodes can live anywhere in memory. They do not need to be adjacent. The pointer in each node is what creates the logical sequence — it tells you where the next element is, regardless of where it physically sits in RAM.

```
Memory (physical):
Address:  1000        3500        2200        4100
          ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
          │ 10     │  │ 20     │  │ 30     │  │ 40     │
          │ → 3500 │  │ → 2200 │  │ → 4100 │  │ → NULL │
          └────────┘  └────────┘  └────────┘  └────────┘

Logical sequence:  10 → 20 → 30 → 40 → NULL
```

The nodes are scattered across memory, but the pointer chain creates a perfectly ordered sequence.

---

### 1.3 Array vs. Linked List — A Fundamental Comparison

|Criterion|Array|Linked List|
|---|---|---|
|Memory allocation|Contiguous, compile time|Scattered, runtime|
|Size|Fixed|Dynamic — grows and shrinks|
|Access by index|O(1) — direct calculation|O(n) — must traverse|
|Insertion at front|O(n) — all elements shift|O(1) — just update pointers|
|Deletion from front|O(n) — all elements shift|O(1) — just update pointers|
|Memory efficiency|May waste (over-allocated)|Exact — only what is needed|
|Extra memory per element|None|One pointer per node|

Neither is universally better. The choice depends on which operations your program performs most frequently.

---

## 2. Representation of Linked List in Memory

### 2.1 The Node Structure

Every linked list is built from nodes. A node is a structure containing data and a pointer to the next node.

```c
typedef struct Node
{
    int          data;    // The value stored in this node
    struct Node *next;    // Address of the next node (NULL if last)
} Node;
```

This is a **self-referential structure** — it contains a pointer to its own type. The `next` field does not store another node — it stores the _address_ of the next node, which may be anywhere in memory.

### 2.2 The Head Pointer

The entire linked list is accessed through a single pointer called **head**, which stores the address of the first node. If `head == NULL`, the list is empty.

```c
Node *head = NULL;   // Empty list
```

```
head
  │
  ↓
┌────────┐    ┌────────┐    ┌────────┐
│ data:10│    │ data:20│    │ data:30│
│ next ──┼───►│ next ──┼───►│ next  ─┼──► NULL
└────────┘    └────────┘    └────────┘
   1000          2500          3800
```

To access the list, you start at `head` and follow the `next` pointers until you reach `NULL`.

### 2.3 Creating a Node Dynamically

```c
Node* createNode(int value)
{
    Node *newNode = (Node *) malloc(sizeof(Node));  // Allocate on Heap

    if (newNode == NULL)
    {
        printf("Memory allocation failed\n");
        return NULL;
    }

    newNode->data = value;   // Set the data
    newNode->next = NULL;    // Points nowhere yet

    return newNode;
}
```

Every node is born on the Heap via `malloc`. It persists until explicitly freed with `free`. This is the lifecycle of every linked list node.

---

## 3. Singly Linked List

A **Singly Linked List** is the simplest form — each node has one `next` pointer, creating a one-directional chain. You can traverse from front to back, but not from back to front.

```
head → [10|→] → [20|→] → [30|→] → [40|NULL]
```

---

### 3.1 Operation 1 — Creation / Insertion at Beginning

Inserting at the beginning is the most natural operation — it requires updating only the `head` pointer.

```c
Node* insertAtBeginning(Node *head, int value)
{
    Node *newNode = createNode(value);

    newNode->next = head;   // New node points to current first node
    head = newNode;         // head now points to new node

    return head;
}
```

**Trace — Insert 10, then Insert 5 at beginning:**

```
Start:    head = NULL

Insert 10:
  newNode → [10|NULL]
  newNode->next = NULL  (head was NULL)
  head = newNode
  Result:  head → [10|NULL]

Insert 5 at beginning:
  newNode → [5|NULL]
  newNode->next = head  → [5|→[10|NULL]]
  head = newNode
  Result:  head → [5|→] → [10|NULL]
```

**Time Complexity:** O(1) — no traversal needed.

---

### 3.2 Operation 2 — Insertion at End

To insert at the end, you must traverse to the last node (the one whose `next` is `NULL`), then attach the new node.

```c
Node* insertAtEnd(Node *head, int value)
{
    Node *newNode = createNode(value);

    if (head == NULL)        // List is empty — new node IS the list
        return newNode;

    Node *temp = head;
    while (temp->next != NULL)  // Traverse to last node
        temp = temp->next;

    temp->next = newNode;    // Attach new node at end
    return head;
}
```

**Trace — Insert 30 at end of [10] → [20]:**

```
head → [10|→] → [20|NULL]

temp starts at head (10)
temp->next = [20] ≠ NULL → move: temp = [20]
temp->next = NULL → STOP (we are at last node)

temp->next = newNode → [10|→] → [20|→] → [30|NULL]
```

**Time Complexity:** O(n) — must reach the last node.

---

### 3.3 Operation 3 — Insertion at a Given Position

```c
Node* insertAtPosition(Node *head, int value, int position)
{
    Node *newNode = createNode(value);

    if (position == 0)          // Insert at beginning
    {
        newNode->next = head;
        return newNode;
    }

    Node *temp = head;
    for (int i = 0; i < position - 1 && temp != NULL; i++)
        temp = temp->next;      // Reach node just before position

    if (temp == NULL)
    {
        printf("Position out of range\n");
        free(newNode);
        return head;
    }

    newNode->next = temp->next; // New node points to node after position
    temp->next = newNode;       // Previous node points to new node
    return head;
}
```

**Trace — Insert 25 at position 2 in [10] → [20] → [30]:**

```
Before: head → [10|→] → [20|→] → [30|NULL]
                                     position 2 = here

Step 1: Traverse to position 1 (node with 20)
        temp → [20|→[30]]

Step 2: newNode->next = temp->next  → [25|→[30]]
Step 3: temp->next = newNode        → [20|→[25]]

After:  head → [10|→] → [20|→] → [25|→] → [30|NULL]
```

**Time Complexity:** O(n)

---

### 3.4 Operation 4 — Traversal

Visit every node once, from head to the last node.

```c
void traverse(Node *head)
{
    Node *temp = head;
    printf("List: ");

    while (temp != NULL)
    {
        printf("%d ", temp->data);
        temp = temp->next;
    }
    printf("→ NULL\n");
}
```

**Algorithm:**

```
Step 1: temp = head
Step 2: While temp ≠ NULL, do:
          Process temp->data
          temp = temp->next
Step 3: Stop
```

**Time Complexity:** O(n) — every node visited once.

---

### 3.5 Operation 5 — Searching

Search for a node with a given value. Return its position (0-indexed) or -1 if not found.

```c
int search(Node *head, int key)
{
    Node *temp = head;
    int  position = 0;

    while (temp != NULL)
    {
        if (temp->data == key)
            return position;    // Found — return index

        temp = temp->next;
        position++;
    }
    return -1;                  // Not found
}
```

**Time Complexity:** O(n) — may need to check every node.

---

### 3.6 Operation 6 — Deletion from Beginning

```c
Node* deleteFromBeginning(Node *head)
{
    if (head == NULL)
    {
        printf("List is empty — nothing to delete\n");
        return NULL;
    }

    Node *temp = head;    // Save current head
    head = head->next;    // Move head to second node
    free(temp);           // Free old head
    temp = NULL;

    return head;
}
```

**Trace — Delete from beginning of [10] → [20] → [30]:**

```
temp = head → [10|→[20]]
head = head->next → head now points to [20]
free(temp) → [10] is destroyed

Result: head → [20|→] → [30|NULL]
```

**Time Complexity:** O(1)

---

### 3.7 Operation 7 — Deletion from End

```c
Node* deleteFromEnd(Node *head)
{
    if (head == NULL)
    {
        printf("List is empty\n");
        return NULL;
    }

    if (head->next == NULL)   // Only one node
    {
        free(head);
        return NULL;
    }

    Node *temp = head;
    while (temp->next->next != NULL)  // Stop at second-to-last node
        temp = temp->next;

    free(temp->next);         // Free last node
    temp->next = NULL;        // Second-to-last becomes new last

    return head;
}
```

**Trace — Delete from end of [10] → [20] → [30]:**

```
temp starts at [10]
temp->next->next = [30]->next = NULL? No → move to [20]
temp->next->next = NULL? Yes → STOP (temp is at [20])

free(temp->next) → free [30]
temp->next = NULL → [20] is now last

Result: head → [10|→] → [20|NULL]
```

**Time Complexity:** O(n)

---

### 3.8 Operation 8 — Deletion by Value

```c
Node* deleteByValue(Node *head, int key)
{
    if (head == NULL) return NULL;

    // If head itself is to be deleted
    if (head->data == key)
    {
        Node *temp = head;
        head = head->next;
        free(temp);
        return head;
    }

    Node *temp = head;
    while (temp->next != NULL && temp->next->data != key)
        temp = temp->next;

    if (temp->next == NULL)
    {
        printf("%d not found in list\n", key);
        return head;
    }

    Node *toDelete = temp->next;       // Node to be removed
    temp->next = toDelete->next;       // Bypass it
    free(toDelete);

    return head;
}
```

**Trace — Delete 20 from [10] → [20] → [30]:**

```
temp starts at [10]
temp->next->data = 20 = key → STOP

toDelete = temp->next → [20|→[30]]
temp->next = toDelete->next → [10|→[30]]
free(toDelete) → [20] destroyed

Result: head → [10|→] → [30|NULL]
```

**Time Complexity:** O(n)

---

### 3.9 Complete Singly Linked List Program

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node
{
    int   data;
    struct Node *next;
} Node;

Node* createNode(int value)
{
    Node *n   = (Node *) malloc(sizeof(Node));
    n->data   = value;
    n->next   = NULL;
    return n;
}

Node* insertAtEnd(Node *head, int value)
{
    Node *newNode = createNode(value);
    if (head == NULL) return newNode;
    Node *temp = head;
    while (temp->next != NULL) temp = temp->next;
    temp->next = newNode;
    return head;
}

Node* deleteByValue(Node *head, int key)
{
    if (head == NULL) return NULL;
    if (head->data == key) { Node *t = head; head = head->next; free(t); return head; }
    Node *temp = head;
    while (temp->next && temp->next->data != key) temp = temp->next;
    if (temp->next) { Node *t = temp->next; temp->next = t->next; free(t); }
    return head;
}

void traverse(Node *head)
{
    while (head) { printf("%d → ", head->data); head = head->next; }
    printf("NULL\n");
}

int main()
{
    Node *head = NULL;
    head = insertAtEnd(head, 10);
    head = insertAtEnd(head, 20);
    head = insertAtEnd(head, 30);
    head = insertAtEnd(head, 40);
    traverse(head);               // 10 → 20 → 30 → 40 → NULL
    head = deleteByValue(head, 20);
    traverse(head);               // 10 → 30 → 40 → NULL
    return 0;
}
```

---

## 4. Doubly Linked List

### 4.1 Concept

A **Doubly Linked List** is a linked list in which each node has **two pointers** — one pointing to the next node and one pointing to the previous node. This allows traversal in **both directions** — forward and backward.

```c
typedef struct DNode
{
    int          data;
    struct DNode *prev;   // Points to previous node
    struct DNode *next;   // Points to next node
} DNode;
```

**Memory Representation:**

```
NULL ← [prev|10|next] ⇄ [prev|20|next] ⇄ [prev|30|next] → NULL
        ↑
       head
```

Each node has two links. The `prev` of the first node is `NULL`. The `next` of the last node is `NULL`.

---

### 4.2 Creating a DLL Node

```c
DNode* createDNode(int value)
{
    DNode *n  = (DNode *) malloc(sizeof(DNode));
    n->data   = value;
    n->prev   = NULL;
    n->next   = NULL;
    return n;
}
```

---

### 4.3 Insertion at Beginning — DLL

```c
DNode* insertAtBeginning(DNode *head, int value)
{
    DNode *newNode = createDNode(value);

    if (head != NULL)
    {
        newNode->next = head;    // New node points forward to old head
        head->prev    = newNode; // Old head points backward to new node
    }

    return newNode;              // New node is the new head
}
```

**Trace — Insert 5 at beginning of [10] ⇄ [20]:**

```
Before: NULL ← [10] ⇄ [20] → NULL

newNode = [5|prev:NULL|next:NULL]

newNode->next = head        → [5|prev:NULL|next:→[10]]
head->prev    = newNode     → [10|prev:→[5]|next:→[20]]

After: NULL ← [5] ⇄ [10] ⇄ [20] → NULL
```

---

### 4.4 Insertion at End — DLL

```c
DNode* insertAtEnd(DNode *head, int value)
{
    DNode *newNode = createDNode(value);

    if (head == NULL) return newNode;

    DNode *temp = head;
    while (temp->next != NULL)   // Traverse to last node
        temp = temp->next;

    temp->next    = newNode;     // Last node's next → new node
    newNode->prev = temp;        // New node's prev → last node

    return head;
}
```

---

### 4.5 Deletion by Value — DLL

The key difference from singly LL: you must update **both** `prev` and `next` pointers of surrounding nodes.

```c
DNode* deleteByValue(DNode *head, int key)
{
    if (head == NULL) return NULL;

    DNode *temp = head;
    while (temp != NULL && temp->data != key)
        temp = temp->next;

    if (temp == NULL)
    {
        printf("%d not found\n", key);
        return head;
    }

    if (temp->prev != NULL)
        temp->prev->next = temp->next;  // Previous node skips over temp
    else
        head = temp->next;              // Deleting head — update head

    if (temp->next != NULL)
        temp->next->prev = temp->prev;  // Next node points back past temp

    free(temp);
    return head;
}
```

**Trace — Delete 20 from [10] ⇄ [20] ⇄ [30]:**

```
temp → [20|prev:→[10]|next:→[30]]

temp->prev->next = temp->next  →  [10|next:→[30]]
temp->next->prev = temp->prev  →  [30|prev:→[10]]
free(temp)

After: NULL ← [10] ⇄ [30] → NULL
```

---

### 4.6 Forward and Backward Traversal

```c
void traverseForward(DNode *head)
{
    printf("Forward:  ");
    while (head != NULL) { printf("%d → ", head->data); head = head->next; }
    printf("NULL\n");
}

void traverseBackward(DNode *head)
{
    if (head == NULL) return;

    // Go to last node first
    while (head->next != NULL)
        head = head->next;

    printf("Backward: ");
    while (head != NULL) { printf("%d → ", head->data); head = head->prev; }
    printf("NULL\n");
}
```

---

### 4.7 Singly vs. Doubly Linked List

|Feature|Singly LL|Doubly LL|
|---|---|---|
|Pointers per node|1 (`next`)|2 (`next` + `prev`)|
|Memory per node|Less|More|
|Traversal|Forward only|Forward and backward|
|Deletion|Need previous node's address|Self-contained — no need|
|Insertion before a node|O(n) — find previous first|O(1) if node pointer given|
|Complexity|Simpler|More pointer updates required|

---

## 5. Circular Linked List

### 5.1 Concept

A **Circular Linked List** is one where the last node's `next` pointer, instead of being `NULL`, points back to the **first node** — forming a circle.

```
head → [10|→] → [20|→] → [30|→] → [40|→]
          ↑___________________________________|
```

There is no `NULL` at the end. Traversal continues indefinitely if not controlled. The stopping condition during traversal is returning to `head` (or the starting node).

---

### 5.2 Circular Singly Linked List — Insertion at End

```c
Node* insertAtEnd(Node *head, int value)
{
    Node *newNode = createNode(value);

    if (head == NULL)
    {
        newNode->next = newNode;  // Points to itself — single node circle
        return newNode;
    }

    Node *temp = head;
    while (temp->next != head)   // Traverse until we reach back to head
        temp = temp->next;

    temp->next    = newNode;     // Last node points to new node
    newNode->next = head;        // New node points back to head

    return head;
}
```

---

### 5.3 Traversal in Circular Linked List

Since there is no `NULL`, traversal must stop when you return to `head`.

```c
void traverse(Node *head)
{
    if (head == NULL) { printf("Empty list\n"); return; }

    Node *temp = head;
    printf("List: ");

    do
    {
        printf("%d → ", temp->data);
        temp = temp->next;
    } while (temp != head);      // Stop when we circle back to start

    printf("(back to head)\n");
}
```

---

### 5.4 Applications of Circular Linked List

- **Round-Robin Scheduling** — OS allocates CPU time to each process in turns, cycling back to the first after the last.
- **Circular Buffer** — Audio/video streaming buffers that overwrite old data when full.
- **Multiplayer Games** — Turn rotation among players in a loop.

---

## 6. Stack Using Linked List

In Unit II, the stack was built on an array with a fixed `MAX` size. Using a linked list, the stack has **no size limit** (other than available memory), and each push dynamically creates a node.

The top of the stack is always the **head** of the linked list — insertion and deletion both happen at the front, giving O(1) operations.

```
Stack:  top → [30|→] → [20|→] → [10|NULL]
                (top)             (bottom)
```

---

### 6.1 Push — Insert at Front

```c
Node* push(Node *top, int value)
{
    Node *newNode = createNode(value);
    newNode->next = top;   // New node points to current top
    return newNode;        // New node IS the new top
}
```

---

### 6.2 Pop — Delete from Front

```c
int pop(Node **top)
{
    if (*top == NULL)
    {
        printf("Stack Underflow\n");
        return -1;
    }
    int value  = (*top)->data;
    Node *temp = *top;
    *top       = (*top)->next;   // Move top to next node
    free(temp);                  // Free the old top node
    return value;
}
```

---

### 6.3 Peek

```c
int peek(Node *top)
{
    if (top == NULL) { printf("Stack empty\n"); return -1; }
    return top->data;
}
```

---

### 6.4 Complete Stack Using Linked List

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

Node* createNode(int v) { Node *n = malloc(sizeof(Node)); n->data=v; n->next=NULL; return n; }

Node* push(Node *top, int value)
{
    Node *n   = createNode(value);
    n->next   = top;
    return n;
}

int pop(Node **top)
{
    if (*top == NULL) { printf("Underflow\n"); return -1; }
    int v    = (*top)->data;
    Node *t  = *top;
    *top     = (*top)->next;
    free(t);
    return v;
}

void display(Node *top)
{
    printf("Stack (top→bottom): ");
    while (top) { printf("%d ", top->data); top = top->next; }
    printf("\n");
}

int main()
{
    Node *top = NULL;
    top = push(top, 10);
    top = push(top, 20);
    top = push(top, 30);
    display(top);                      // 30 20 10
    printf("Popped: %d\n", pop(&top)); // Popped: 30
    display(top);                      // 20 10
    return 0;
}
```

---

### 6.5 Array Stack vs. Linked List Stack

|Feature|Array Stack|Linked List Stack|
|---|---|---|
|Size|Fixed (`MAX`)|Dynamic — unlimited|
|Overflow|Yes — when `top == MAX-1`|No — only when heap is full|
|Memory|Pre-allocated (may waste)|Exact — only what is used|
|Access speed|Slightly faster (direct index)|Slightly slower (pointer follow)|
|Memory per element|Just the data|Data + one pointer|

---

## 7. Queue Using Linked List

In a linked list queue, we maintain **two pointers** — `front` (for dequeue) and `rear` (for enqueue). Enqueue adds to the rear; dequeue removes from the front. Both operations are O(1).

```
front → [10|→] → [20|→] → [30|→] → [40|NULL] ← rear
         (remove here)                (add here)
```

---

### 7.1 Enqueue — Insert at Rear

```c
Node* enqueue(Node **front, Node **rear, int value)
{
    Node *newNode = createNode(value);

    if (*rear == NULL)           // Empty queue
    {
        *front = *rear = newNode;
        return newNode;
    }

    (*rear)->next = newNode;     // Current rear points to new node
    *rear         = newNode;     // Update rear to new node
    return *front;
}
```

---

### 7.2 Dequeue — Remove from Front

```c
int dequeue(Node **front, Node **rear)
{
    if (*front == NULL)
    {
        printf("Queue Underflow\n");
        return -1;
    }

    int value  = (*front)->data;
    Node *temp = *front;
    *front     = (*front)->next;  // Move front to next node

    if (*front == NULL)           // Queue is now empty
        *rear = NULL;

    free(temp);
    return value;
}
```

---

### 7.3 Complete Queue Using Linked List

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

Node* createNode(int v) { Node *n = malloc(sizeof(Node)); n->data=v; n->next=NULL; return n; }

void enqueue(Node **front, Node **rear, int value)
{
    Node *n = createNode(value);
    if (*rear == NULL) { *front = *rear = n; return; }
    (*rear)->next = n;
    *rear = n;
}

int dequeue(Node **front, Node **rear)
{
    if (*front == NULL) { printf("Underflow\n"); return -1; }
    int v = (*front)->data;
    Node *t = *front;
    *front = (*front)->next;
    if (*front == NULL) *rear = NULL;
    free(t);
    return v;
}

void display(Node *front)
{
    printf("Queue (front→rear): ");
    while (front) { printf("%d ", front->data); front = front->next; }
    printf("\n");
}

int main()
{
    Node *front = NULL, *rear = NULL;
    enqueue(&front, &rear, 10);
    enqueue(&front, &rear, 20);
    enqueue(&front, &rear, 30);
    display(front);                        // 10 20 30
    printf("Dequeued: %d\n", dequeue(&front, &rear)); // Dequeued: 10
    display(front);                        // 20 30
    return 0;
}
```

---

### 7.4 Array Queue vs. Linked List Queue

|Feature|Array Queue|Linked List Queue|
|---|---|---|
|Size|Fixed — needs Circular Queue trick|Dynamic — truly unlimited|
|Memory waste|Yes — circular trick needed|No waste|
|Overflow|Possible|Only when heap exhausted|
|Implementation|Simpler|Slightly more complex|
|Memory per element|Just the data|Data + one pointer|

---

## Unit III — Complete Summary

|Topic|Core Concept|
|---|---|
|Linked Organisation|Nodes scattered in memory, connected by pointers|
|Node Structure|`data` + `next` pointer (+ `prev` for DLL)|
|Head pointer|Entry point to list; `NULL` means empty|
|`createNode`|`malloc` → set data → set `next = NULL` → return|
|Singly LL — Insert at front|O(1) — update head|
|Singly LL — Insert at end|O(n) — traverse to last node|
|Singly LL — Delete from front|O(1) — update head, free old|
|Singly LL — Delete from end|O(n) — reach second-to-last|
|Traversal|Follow `next` until `NULL` — O(n)|
|Search|Scan from head — O(n)|
|Doubly LL|Two pointers per node — enables backward traversal|
|DLL Deletion advantage|No need to find previous node separately|
|Circular LL|Last node's `next` → head; no NULL at end|
|Circular traversal|`do-while` loop stopping when back at `head`|
|Stack using LL|Top = head; push/pop at front — O(1), no size limit|
|Queue using LL|Enqueue at rear, dequeue at front — O(1), no size limit|
|Linked List vs Array|LL: dynamic, fast insert/delete; Array: O(1) access|

---

> **Professor's Note before Unit IV:** The linked list is not just a data structure — it is a pattern of thinking. The idea of connecting independently allocated nodes through pointers is the foundation of every advanced structure that follows. A binary tree is a node with two `next` pointers. A graph is a collection of nodes each with a list of neighbour pointers. When you study Unit IV and encounter a Binary Search Tree node, you will recognise it immediately as a linked list node with an extra pointer. The syntax changes; the concept does not.

---

_Next: Unit IV → Trees_