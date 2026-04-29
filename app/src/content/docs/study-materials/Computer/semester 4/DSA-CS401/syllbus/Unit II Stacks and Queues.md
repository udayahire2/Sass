# CS401 — Data Structures & Algorithms

# Unit II: Stacks and Queues

### _Linear Data Structures with Restricted Access_

> **Syllabus Coverage:** Introduction to Stacks & Queues · Stack using Array · Applications (Arithmetic Expressions, Recursion, Tower of Hanoi) · Queue using Array · Circular Queue **Lectures:** 08 Hours | **Marks:** 12

---

## Preface to This Unit

An array gives you complete freedom — you can access, insert, or delete any element at any position. Sometimes, however, that freedom is exactly what you do not want. Certain problems are solved more cleanly, more safely, and more correctly when access is deliberately restricted.

A **Stack** allows access from one end only. A **Queue** allows insertion at one end and removal from the other. These restrictions are not limitations — they are _guarantees_. They make these structures predictable, and that predictability is what makes them powerful.

By the end of this unit, you will not just know how to implement a stack or a queue — you will understand _why_ they exist, and you will see them operating inside arithmetic expression evaluation, recursive function calls, and printer scheduling systems.

---

## 1. Introduction to Stacks

### 1.1 What is a Stack?

A **Stack** is a linear data structure in which elements are inserted and removed from the **same end**, called the **top**.

The governing principle is **LIFO — Last In, First Out**. The last element you put in is always the first one to come out.

The physical analogy is a stack of plates in a cafeteria. You place a new plate on top, and you always pick up from the top. The plate placed last is removed first. The plate placed first is buried at the bottom and comes out last.

```
        ┌───────┐
  top → │  40   │  ← Last inserted, first to be removed
        ├───────┤
        │  30   │
        ├───────┤
        │  20   │
        ├───────┤
        │  10   │  ← First inserted, last to be removed
        └───────┘
```

---

### 1.2 Stack Terminology

|Term|Meaning|
|---|---|
|**Top**|Index of the topmost element (the one most recently inserted)|
|**Push**|Insert an element onto the top of the stack|
|**Pop**|Remove the element from the top of the stack|
|**Peek / Top**|View the top element without removing it|
|**Overflow**|Attempting to push onto a full stack|
|**Underflow**|Attempting to pop from an empty stack|

---

## 2. Stack Representation Using Array

An array is the simplest way to implement a stack. We use a variable called `top` to track the index of the topmost element. Initially, when the stack is empty, `top = -1`.

### 2.1 Stack Structure

```c
#include <stdio.h>
#define MAX 100     // Maximum stack capacity

int stack[MAX];     // Array to hold stack elements
int top = -1;       // top = -1 means stack is empty
```

---

### 2.2 Operation 1 — isEmpty

Checks whether the stack has any elements.

```c
int isEmpty()
{
    return (top == -1);   // Returns 1 (true) if empty, 0 (false) otherwise
}
```

---

### 2.3 Operation 2 — isFull

Checks whether the stack has reached its maximum capacity.

```c
int isFull()
{
    return (top == MAX - 1);  // Returns 1 (true) if full
}
```

---

### 2.4 Operation 3 — Push

Inserts a new element onto the top of the stack.

```c
void push(int value)
{
    if (isFull())
    {
        printf("Stack Overflow — cannot push %d\n", value);
        return;
    }
    top++;               // Move top up by one
    stack[top] = value;  // Place the new element at top
    printf("%d pushed onto stack\n", value);
}
```

**Algorithm:**

```
Step 1: If top = MAX - 1, print "Overflow" and stop
Step 2: top = top + 1
Step 3: stack[top] = value
Step 4: Stop
```

**Trace — Push 10, 20, 30:**

```
Initial:  top = -1     stack = [ ][ ][ ][ ][ ]

Push 10:  top = 0      stack = [10][ ][ ][ ][ ]
Push 20:  top = 1      stack = [10][20][ ][ ][ ]
Push 30:  top = 2      stack = [10][20][30][ ][ ]
```

**Time Complexity:** O(1) — always inserts at `top`, no shifting.

---

### 2.5 Operation 4 — Pop

Removes and returns the element from the top of the stack.

```c
int pop()
{
    if (isEmpty())
    {
        printf("Stack Underflow — stack is empty\n");
        return -1;
    }
    int value = stack[top];  // Save top element
    top--;                   // Move top down by one
    return value;
}
```

**Algorithm:**

```
Step 1: If top = -1, print "Underflow" and stop
Step 2: value = stack[top]
Step 3: top = top - 1
Step 4: Return value
Step 5: Stop
```

**Trace — Pop from stack [10][20][30], top = 2:**

```
Pop:  value = stack[2] = 30,  top = 1   → returns 30
Pop:  value = stack[1] = 20,  top = 0   → returns 20
Pop:  value = stack[0] = 10,  top = -1  → returns 10
Pop:  top = -1 → Underflow
```

**Time Complexity:** O(1)

---

### 2.6 Operation 5 — Peek

Returns the top element without removing it.

```c
int peek()
{
    if (isEmpty())
    {
        printf("Stack is empty\n");
        return -1;
    }
    return stack[top];
}
```

**Time Complexity:** O(1)

---

### 2.7 Complete Stack Implementation

```c
#include <stdio.h>
#define MAX 5

int stack[MAX];
int top = -1;

int isEmpty() { return (top == -1); }
int isFull()  { return (top == MAX - 1); }

void push(int value)
{
    if (isFull()) { printf("Overflow\n"); return; }
    stack[++top] = value;
}

int pop()
{
    if (isEmpty()) { printf("Underflow\n"); return -1; }
    return stack[top--];
}

int peek()
{
    if (isEmpty()) return -1;
    return stack[top];
}

void display()
{
    if (isEmpty()) { printf("Stack is empty\n"); return; }
    printf("Stack (top → bottom): ");
    for (int i = top; i >= 0; i--)
        printf("%d ", stack[i]);
    printf("\n");
}

int main()
{
    push(10); push(20); push(30);
    display();           // Stack: 30 20 10
    printf("Top: %d\n", peek());    // Top: 30
    printf("Popped: %d\n", pop());  // Popped: 30
    display();           // Stack: 20 10
    return 0;
}
```

---

## 3. Applications of Stack

### 3.1 Application 1 — Arithmetic Expression Evaluation

This is one of the most important and examined applications of stacks. To understand it, you first need to understand the three ways an arithmetic expression can be written.

#### The Three Notations

|Notation|Position of Operator|Example|
|---|---|---|
|**Infix**|Between operands|`A + B`|
|**Prefix (Polish)**|Before operands|`+ A B`|
|**Postfix (Reverse Polish)**|After operands|`A B +`|

Humans naturally write and read **infix** expressions. Computers, however, find infix expressions difficult to evaluate because of operator precedence and parentheses. **Postfix** expressions have no parentheses and no precedence rules — every expression has exactly one evaluation order. This is why compilers convert infix to postfix before evaluating.

**Operator Precedence (high to low):**

|Priority|Operator|
|---|---|
|Highest|`^` (exponentiation)|
|High|`*` `/` `%`|
|Low|`+` `-`|
|Lowest|`(` `)`|

---

#### Converting Infix to Postfix (Using Stack)

**Algorithm:**

```
Step 1: Scan expression left to right
Step 2: If operand → directly add to output
Step 3: If '(' → push onto stack
Step 4: If ')' → pop and output until '(' is found; discard '('
Step 5: If operator → pop and output all operators with higher or
        equal precedence, then push current operator
Step 6: After full scan → pop and output all remaining stack elements
```

**Complete Trace — Convert `A + B * C - D` to Postfix:**

```
Token  Action                    Stack        Output
-----  ------                    -----        ------
 A     Operand → output           ( )          A
 +     Push (stack empty)         (+)          A
 B     Operand → output           (+)          A B
 *     * > + so push              (+*)         A B
 C     Operand → output           (+*)         A B C
 -     - <= * so pop *            (+)          A B C *
       - <= + so pop +            ( )          A B C * +
       Push -                     (-)          A B C * +
 D     Operand → output           (-)          A B C * + D
End    Pop remaining              ( )          A B C * + D -

Postfix Result: A B C * + D -
```

---

#### Evaluating a Postfix Expression (Using Stack)

**Algorithm:**

```
Step 1: Scan expression left to right
Step 2: If operand → push onto stack
Step 3: If operator → pop two operands (b then a),
        compute (a operator b), push result back
Step 4: Final stack top = result
```

**Trace — Evaluate `5 3 2 * + 4 -`:**

```
Token  Action                              Stack
-----  ------                              -----
 5     Push 5                              [5]
 3     Push 3                              [5, 3]
 2     Push 2                              [5, 3, 2]
 *     Pop 2, Pop 3 → 3 * 2 = 6, Push 6   [5, 6]
 +     Pop 6, Pop 5 → 5 + 6 = 11, Push 11 [11]
 4     Push 4                              [11, 4]
 -     Pop 4, Pop 11 → 11 - 4 = 7, Push 7 [7]

Result = 7
```

```c
// Postfix evaluation — core logic
int evaluatePostfix(char *expr)
{
    int stack[MAX], top = -1;

    for (int i = 0; expr[i] != '\0'; i++)
    {
        char ch = expr[i];

        if (ch >= '0' && ch <= '9')         // Operand
            stack[++top] = ch - '0';
        else                                // Operator
        {
            int b = stack[top--];
            int a = stack[top--];

            if      (ch == '+') stack[++top] = a + b;
            else if (ch == '-') stack[++top] = a - b;
            else if (ch == '*') stack[++top] = a * b;
            else if (ch == '/') stack[++top] = a / b;
        }
    }
    return stack[top];
}
```

---

### 3.2 Application 2 — Recursion and the Call Stack

Every time a function calls itself (or any function calls another), the program uses a **call stack** to remember where to return.

When a function is called:

1. Its local variables and parameters are **pushed** onto the call stack
2. Execution jumps into the function
3. When the function returns, the frame is **popped** and execution resumes exactly where it left off

```c
int factorial(int n)
{
    if (n == 0) return 1;         // Base case — start returning
    return n * factorial(n - 1); // Recursive call — push new frame
}
```

**Call Stack Trace for `factorial(4)`:**

```
PUSH: factorial(4) → waiting for factorial(3)
  PUSH: factorial(3) → waiting for factorial(2)
    PUSH: factorial(2) → waiting for factorial(1)
      PUSH: factorial(1) → waiting for factorial(0)
        PUSH: factorial(0) → returns 1
      POP: factorial(1) → returns 1 * 1 = 1
    POP: factorial(2) → returns 2 * 1 = 2
  POP: factorial(3) → returns 3 * 2 = 6
POP: factorial(4) → returns 4 * 6 = 24

Final Answer: 24
```

**Stack Overflow** occurs when recursion goes too deep — the call stack runs out of space. This is why `factorial(100000)` would crash — not because the math is wrong, but because thousands of frames would exhaust the stack memory.

---

### 3.3 Application 3 — Tower of Hanoi

**Problem Statement:** There are 3 rods — Source (S), Auxiliary (A), and Destination (D). There are `n` discs of different sizes stacked on the Source rod, smallest on top. Move all discs from Source to Destination using Auxiliary, following these rules:

1. Move only **one disc at a time**
2. A **larger disc can never be placed on a smaller disc**

**The Recursive Insight:** To move `n` discs from S to D using A:

1. Move the top `n-1` discs from S to A (using D as auxiliary)
2. Move the largest disc (disc `n`) from S to D
3. Move the `n-1` discs from A to D (using S as auxiliary)

```c
void towerOfHanoi(int n, char source, char dest, char aux)
{
    if (n == 1)   // Base case: one disc — move directly
    {
        printf("Move disc 1 from %c to %c\n", source, dest);
        return;
    }
    // Step 1: Move n-1 discs from source to aux
    towerOfHanoi(n - 1, source, aux, dest);

    // Step 2: Move largest disc from source to dest
    printf("Move disc %d from %c to %c\n", n, source, dest);

    // Step 3: Move n-1 discs from aux to dest
    towerOfHanoi(n - 1, aux, dest, source);
}

int main()
{
    towerOfHanoi(3, 'S', 'D', 'A');
    return 0;
}
```

**Output for n = 3:**

```
Move disc 1 from S to D
Move disc 2 from S to A
Move disc 1 from D to A
Move disc 3 from S to D
Move disc 1 from A to S
Move disc 2 from A to D
Move disc 1 from S to D
```

**Total moves required:** 2ⁿ - 1

|n (discs)|Moves Required|
|---|---|
|1|1|
|2|3|
|3|7|
|4|15|
|n|2ⁿ - 1|

**Time Complexity:** O(2ⁿ) — exponential. This is unavoidable; it is mathematically proven to be the minimum number of moves possible.

---

## 4. Introduction to Queues

### 4.1 What is a Queue?

A **Queue** is a linear data structure in which elements are inserted from one end (called the **Rear**) and removed from the other end (called the **Front**).

The governing principle is **FIFO — First In, First Out**. The first element inserted is the first to be removed.

The analogy is a queue at a ticket counter. The first person to join the queue is the first to be served. No one can cut in at the front; everyone joins at the back.

```
Rear end (insertion)           Front end (removal)
       ↓                               ↓
    ┌────┬────┬────┬────┬────┐
    │ 40 │ 30 │ 20 │ 10 │    │
    └────┴────┴────┴────┴────┘
    Joined last               Joined first → served first
```

---

### 4.2 Queue Terminology

|Term|Meaning|
|---|---|
|**Front**|Index pointing to the first element (the one to be removed next)|
|**Rear**|Index pointing to the last element (the most recently inserted)|
|**Enqueue**|Insert an element at the Rear end|
|**Dequeue**|Remove an element from the Front end|
|**Overflow**|Attempting to enqueue into a full queue|
|**Underflow**|Attempting to dequeue from an empty queue|

---

## 5. Queue Representation Using Array

```c
#include <stdio.h>
#define MAX 5

int queue[MAX];
int front = -1;
int rear  = -1;
```

When both `front` and `rear` are `-1`, the queue is empty.

---

### 5.1 isEmpty and isFull

```c
int isEmpty()
{
    return (front == -1 || front > rear);
}

int isFull()
{
    return (rear == MAX - 1);
}
```

---

### 5.2 Operation 1 — Enqueue

Insert an element at the Rear.

```c
void enqueue(int value)
{
    if (isFull())
    {
        printf("Queue Overflow — cannot enqueue %d\n", value);
        return;
    }
    if (front == -1) front = 0;  // First element — initialise front
    rear++;
    queue[rear] = value;
    printf("%d enqueued\n", value);
}
```

**Algorithm:**

```
Step 1: If rear = MAX - 1, print "Overflow" and stop
Step 2: If front = -1, set front = 0
Step 3: rear = rear + 1
Step 4: queue[rear] = value
Step 5: Stop
```

**Trace — Enqueue 10, 20, 30, 40:**

```
Initial:   front = -1, rear = -1   queue = [ ][ ][ ][ ][ ]

Enq 10:    front = 0,  rear = 0    queue = [10][ ][ ][ ][ ]
Enq 20:    front = 0,  rear = 1    queue = [10][20][ ][ ][ ]
Enq 30:    front = 0,  rear = 2    queue = [10][20][30][ ][ ]
Enq 40:    front = 0,  rear = 3    queue = [10][20][30][40][ ]
```

**Time Complexity:** O(1)

---

### 5.3 Operation 2 — Dequeue

Remove and return the element at the Front.

```c
int dequeue()
{
    if (isEmpty())
    {
        printf("Queue Underflow — queue is empty\n");
        return -1;
    }
    int value = queue[front];
    front++;

    if (front > rear)       // All elements removed
    {
        front = -1;
        rear  = -1;
    }
    return value;
}
```

**Algorithm:**

```
Step 1: If front = -1 or front > rear, print "Underflow" and stop
Step 2: value = queue[front]
Step 3: front = front + 1
Step 4: If front > rear, reset front = -1, rear = -1
Step 5: Return value
Step 6: Stop
```

**Trace — Dequeue from [10][20][30][40], front=0, rear=3:**

```
Deq:  value = queue[0] = 10,  front = 1  → returns 10
Deq:  value = queue[1] = 20,  front = 2  → returns 20
Deq:  value = queue[2] = 30,  front = 3  → returns 30
Deq:  value = queue[3] = 40,  front = 4  → front > rear → reset → returns 40
Deq:  front = -1 → Underflow
```

**Time Complexity:** O(1)

---

### 5.4 The Problem with a Simple Array Queue

Consider a queue with MAX = 5:

```
Enqueue 10, 20, 30, 40, 50 → rear = 4 (full)
Dequeue 10, 20              → front = 2

Queue state:   [ ][ ][30][40][50]
               ↑         ↑
             (wasted)   front=2, rear=4
```

The queue reports **Overflow** even though indices 0 and 1 are free. Two slots are wasted and unreachable. As dequeues happen, the "usable" portion of the array drifts to the right, and memory at the front is abandoned permanently.

This is the fundamental problem with a simple linear queue — it wastes memory. The solution is the **Circular Queue**.

---

## 6. Circular Queue

### 6.1 Concept

In a **Circular Queue**, the array is treated as if it wraps around — the last index connects back to the first. When `rear` reaches `MAX - 1`, the next insertion goes to index `0` (if it is free), making full use of all available memory.

```
Linear Queue (waste):               Circular Queue (no waste):

[ ][ ][30][40][50]                  [50][  ][30][40][  ]
       ↑       ↑                     ↑           ↑
     front   rear                  rear=0      front=2
```

This circular wrapping is achieved using the **modulo operator**:

```c
rear  = (rear  + 1) % MAX;
front = (front + 1) % MAX;
```

When `rear` is at index 4 (last), `(4 + 1) % 5 = 0` — it wraps back to the start.

---

### 6.2 Circular Queue Structure

```c
#include <stdio.h>
#define MAX 5

int cqueue[MAX];
int front = -1;
int rear  = -1;
```

---

### 6.3 isEmpty and isFull for Circular Queue

```c
int isEmpty()
{
    return (front == -1);
}

int isFull()
{
    // Full when rear's next position = front (circularly)
    return ((rear + 1) % MAX == front);
}
```

---

### 6.4 Enqueue in Circular Queue

```c
void enqueue(int value)
{
    if (isFull())
    {
        printf("Circular Queue Overflow\n");
        return;
    }
    if (front == -1)           // First element
        front = 0;

    rear = (rear + 1) % MAX;   // Circular increment
    cqueue[rear] = value;
    printf("%d enqueued\n", value);
}
```

**Algorithm:**

```
Step 1: If (rear + 1) % MAX = front, print "Overflow" and stop
Step 2: If front = -1, set front = 0
Step 3: rear = (rear + 1) % MAX
Step 4: queue[rear] = value
Step 5: Stop
```

---

### 6.5 Dequeue in Circular Queue

```c
int dequeue()
{
    if (isEmpty())
    {
        printf("Circular Queue Underflow\n");
        return -1;
    }
    int value = cqueue[front];

    if (front == rear)          // Only one element was left
    {
        front = -1;
        rear  = -1;
    }
    else
        front = (front + 1) % MAX;   // Circular increment

    return value;
}
```

**Algorithm:**

```
Step 1: If front = -1, print "Underflow" and stop
Step 2: value = queue[front]
Step 3: If front = rear, set front = -1, rear = -1 (queue now empty)
        Else front = (front + 1) % MAX
Step 4: Return value
Step 5: Stop
```

---

### 6.6 Complete Circular Queue Trace

**MAX = 5. Operations: Enq 10, 20, 30, 40 → Deq × 2 → Enq 50, 60**

```
Step 1 — Enqueue 10, 20, 30, 40:
Index:   [0]  [1]  [2]  [3]  [4]
Value:   [10] [20] [30] [40] [ ]
         front=0,  rear=3

Step 2 — Dequeue twice:
Deq → 10  :  front = (0+1)%5 = 1
Deq → 20  :  front = (1+1)%5 = 2

Index:   [0]  [1]  [2]  [3]  [4]
Value:   [10] [20] [30] [40] [ ]
                    ↑         ↑
                 front=2    rear=3  (slots 0,1 are now reusable)

Step 3 — Enqueue 50:
rear = (3+1)%5 = 4
Index:   [0]  [1]  [2]  [3]  [4]
Value:   [10] [20] [30] [40] [50]
                    ↑         ↑
                 front=2    rear=4

Step 4 — Enqueue 60:
rear = (4+1)%5 = 0   ← WRAPS AROUND
Index:   [0]  [1]  [2]  [3]  [4]
Value:   [60] [20] [30] [40] [50]
          ↑        ↑
         rear=0  front=2

```

The slot at index 0 (previously freed) is now reused. No wastage.

---

### 6.7 Complete Circular Queue Implementation

```c
#include <stdio.h>
#define MAX 5

int cqueue[MAX];
int front = -1, rear = -1;

int isEmpty() { return (front == -1); }
int isFull()  { return ((rear + 1) % MAX == front); }

void enqueue(int value)
{
    if (isFull()) { printf("Overflow\n"); return; }
    if (front == -1) front = 0;
    rear = (rear + 1) % MAX;
    cqueue[rear] = value;
}

int dequeue()
{
    if (isEmpty()) { printf("Underflow\n"); return -1; }
    int value = cqueue[front];
    if (front == rear) { front = -1; rear = -1; }
    else front = (front + 1) % MAX;
    return value;
}

void display()
{
    if (isEmpty()) { printf("Queue is empty\n"); return; }
    printf("Queue: ");
    int i = front;
    while (1)
    {
        printf("%d ", cqueue[i]);
        if (i == rear) break;
        i = (i + 1) % MAX;
    }
    printf("\n");
}

int main()
{
    enqueue(10); enqueue(20); enqueue(30); enqueue(40);
    display();                    // Queue: 10 20 30 40
    printf("Dequeued: %d\n", dequeue()); // Dequeued: 10
    enqueue(50);
    display();                    // Queue: 20 30 40 50
    return 0;
}
```

---

### 6.8 Linear Queue vs. Circular Queue

|Feature|Linear Queue|Circular Queue|
|---|---|---|
|Memory Utilisation|Poor — freed slots at front are wasted|Excellent — freed slots are reused|
|Overflow Condition|`rear == MAX - 1`|`(rear + 1) % MAX == front`|
|Dequeue Condition|`front > rear`|`front == -1`|
|Rear update|`rear = rear + 1`|`rear = (rear + 1) % MAX`|
|Front update|`front = front + 1`|`front = (front + 1) % MAX`|
|Suitability|Simple, one-shot use|Repeated, continuous use|

---

## Unit II — Complete Summary

|Topic|Core Concept|
|---|---|
|Stack|LIFO — Last In, First Out; insertion and removal from same end (top)|
|Push|Add element; check overflow first; increment top|
|Pop|Remove element; check underflow first; decrement top|
|Stack Overflow|Push on full stack — `top == MAX - 1`|
|Stack Underflow|Pop from empty stack — `top == -1`|
|Infix to Postfix|Use stack to handle precedence; output operands directly|
|Postfix Evaluation|Push operands; on operator, pop two, compute, push result|
|Recursion and Stack|Each function call pushes a frame; return pops it|
|Stack Overflow (recursion)|Too many calls exhaust call stack memory|
|Tower of Hanoi|Recursive — 2ⁿ - 1 moves for n discs|
|Queue|FIFO — First In, First Out; insert at rear, remove from front|
|Enqueue|Add at rear; check overflow first|
|Dequeue|Remove from front; check underflow first|
|Linear Queue Problem|Freed front slots are wasted — false overflow occurs|
|Circular Queue|Array treated as circular using `% MAX`; no memory waste|
|Circular isFull|`(rear + 1) % MAX == front`|
|All Stack/Queue operations|O(1) time complexity|

---

> **Professor's Note before Unit III:** You have now seen two data structures where the _restriction on access_ is the feature, not a bug. The stack's LIFO discipline is precisely what makes it correct for expression evaluation and recursion. The queue's FIFO discipline is precisely what makes it correct for scheduling and breadth-first search. In Unit III, you will meet the Linked List — a structure where there are no restrictions on access, but where the nodes themselves are dynamically connected through pointers. The `struct Node` you studied in the C foundation is about to become the central character of your DSA course.

---

_Next: Unit III → Linked Lists_