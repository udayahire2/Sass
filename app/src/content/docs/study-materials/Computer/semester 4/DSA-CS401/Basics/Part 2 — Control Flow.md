# C Programming — Chapter 2: Control Flow

### _Decisions, Repetition, and the Logic That Makes Programs Think_

---

## Preface to This Chapter

Up until now, your programs have been linear — they execute line by line, top to bottom, without any judgement. That changes here. Control flow is where you stop _describing_ data and start _making decisions_ about it. This is where programming logic actually begins.

Understand this chapter well, and every algorithm you study in DSA will feel like a natural extension of these ideas.

---

## 1. Decision Making — Teaching the Program to Choose

A computer has no intelligence of its own. It does one thing, and one thing only — it checks whether a condition is **true or false**, and acts accordingly.

In C, this evaluates to a single, simple rule:

```
Any non-zero value  →  true
Zero                →  false
```

That is all. Every `if` statement, every loop condition, every logical expression in existence reduces to this.

---

### The `if / else if / else` Chain

Use this when your program must choose exactly one path from several possibilities.

```c
int marks = 75;

if (marks >= 90)
    printf("O Grade\n");
else if (marks >= 75)
    printf("A Grade\n");
else if (marks >= 60)
    printf("B Grade\n");
else
    printf("Fail\n");
```

The execution model here is important to visualize correctly. C evaluates conditions **sequentially from top to bottom**, and the moment one condition is satisfied, it executes that block and **exits the entire chain** — it does not check the remaining conditions.

Tracing through the example above:

- `marks >= 90` → false (75 is not ≥ 90)
- `marks >= 75` → true → prints **"A Grade"** → exits

The remaining conditions are never evaluated. This short-circuit behaviour is by design, and understanding it helps you write correct grade checkers, range validators, and search logic.

---

### The Brace Bug — Silent and Dangerous

This is one of the most common mistakes made by programmers who are past the beginner stage and therefore no longer careful:

```c
if (x > 0)
    printf("Positive\n");
    count++;
```

The indentation looks like both lines belong to the `if` block. They do not. In C, **indentation is purely cosmetic** — it means nothing to the compiler. Without braces, only the _immediately following single statement_ belongs to the `if`.

What the compiler actually sees:

```c
if (x > 0)
    printf("Positive\n");  // inside if

count++;  // always executes, regardless of x
```

The correct version:

```c
if (x > 0)
{
    printf("Positive\n");
    count++;
}
```

> **Rule to adopt permanently:** If more than one statement belongs to a conditional block, always use braces. Many experienced programmers use braces even for single-statement blocks, precisely to avoid this trap.

---

## 2. The `switch` Statement — Branching on Fixed Values

When a single variable can take several distinct, known values — and you want a clean, readable way to handle each one — `switch` is the right tool.

```c
int choice = 2;

switch (choice)
{
    case 1:
        printf("Linear Search\n");
        break;

    case 2:
        printf("Binary Search\n");
        break;

    case 3:
        printf("Hashing\n");
        break;

    default:
        printf("Invalid choice\n");
}
```

The `switch` statement jumps directly to the matching `case` label and begins execution from there.

---

### The Role of `break` — And What Happens Without It

`break` tells C: _"Exit this switch block immediately."_

Without it, C does something called **fall-through** — it continues executing every subsequent case, regardless of whether they match, until it hits a`break` or the end of the block.

```c
switch (2)
{
    case 1: printf("A");
    case 2: printf("B");
    case 3: printf("C");
}
```

Output:

```
BC
```

C jumped to `case 2`, printed "B", then — finding no `break` — kept going and printed "C" as well. This is almost always a bug, but it is legal C. The compiler will not warn you.

---

### Intentional Fall-Through — When It Is Actually Useful

Occasionally, fall-through is precisely what you want:

```c
switch (day)
{
    case 1:
    case 7:
        printf("Weekend");
        break;

    default:
        printf("Weekday");
}
```

Here, both `case 1` and `case 7` share the same behaviour. This is clean, deliberate fall-through — two labels pointing to one block of code.

**Restriction worth noting:** `switch` only works with integer types (`int`, `char`). You cannot use it with `float`, `double`, or strings.

---

## 3. Loops — Making Repetition Precise

Every algorithm is, at its core, a set of steps repeated under controlled conditions. Loops are the mechanism that makes this possible. Choose the right loop for the right situation — and understand the difference clearly.

---

### The `for` Loop — When You Know the Count

Use `for` when you know exactly how many times the loop should execute before it begins.

```c
for (int i = 0; i < 5; i++)
{
    printf("%d ", i);
}
```

Output:

```
0 1 2 3 4
```

The `for` loop has three parts, each with a distinct responsibility:

|Part|Expression|Purpose|
|---|---|---|
|Initialisation|`int i = 0`|Set the starting state|
|Condition|`i < 5`|Checked before each iteration; loop runs while true|
|Update|`i++`|Executes after each iteration|

These three parts give you complete, explicit control over the loop's behaviour — which is why `for` is the preferred loop when iteration count is known.

**Useful variations:**

```c
// Reverse traversal
for (int i = 4; i >= 0; i--)

// Step by 2
for (int i = 0; i < 10; i += 2)

// Array traversal (the most common pattern in DSA)
for (int i = 0; i < n; i++)
```

That last pattern — `i = 0` to `i < n` — will appear thousands of times in your DSA work. The condition `i < n` (not `i <= n`) ensures you stay within valid array bounds. One character makes the difference between correct code and a buffer overflow.

---

### The `while` Loop — When You Don't Know the Count

Use `while` when the number of iterations depends on a condition that can only be evaluated at runtime.

```c
int i = 0;

while (i < 5)
{
    printf("%d ", i);
    i++;
}
```

The condition is checked _before_ each iteration. If it is false from the start, the body never executes.

---

#### An Essential Pattern — Sentinel-Controlled Input

```c
int num;
scanf("%d", &num);

while (num != -1)
{
    printf("Got: %d\n", num);
    scanf("%d", &num);
}
```

Here, the loop continues until the user enters `-1` — a _sentinel value_ that signals termination. You do not know in advance how many values the user will enter, so a `for` loop is inappropriate. This pattern appears in stack implementations, queue processing, and file reading. Recognise it and use it confidently.

**Critical detail:** Notice that `scanf` appears _twice_ — once before the loop to get the first value, and once inside the loop to get subsequent values. Forgetting the second `scanf` produces an infinite loop.

---

### The `do-while` Loop — Execute First, Ask Questions Later

`do-while` guarantees the loop body runs **at least once**, because the condition is checked _after_ each iteration, not before.

```c
int i = 0;

do
{
    printf("%d ", i);
    i++;
} while (i < 5);
```

The canonical use case is a menu-driven program:

```c
int choice;

do
{
    printf("1. Insert\n");
    printf("2. Delete\n");
    printf("3. Exit\n");
    scanf("%d", &choice);

} while (choice != 3);
```

This is the natural choice here — a menu _must_ be displayed at least once before there is anything for the user to respond to. A `while` loop would require displaying the menu before the loop begins, making the code awkward.

---

## 4. `break` and `continue` — Controlling Loop Flow Precisely

These two statements give you fine-grained control over what happens inside a loop.

---

### `break` — Exit the Loop Immediately

```c
for (int i = 0; i < 10; i++)
{
    if (i == 5)
        break;

    printf("%d ", i);
}
```

Output:

```
0 1 2 3 4
```

When `i` reaches 5, `break` terminates the loop entirely. Execution continues from the first statement _after_ the loop.

You will use this in search algorithms — when you find what you are looking for, there is no reason to keep iterating.

---

### `continue` — Skip This Iteration, Continue the Loop

```c
for (int i = 0; i < 10; i++)
{
    if (i % 2 == 0)
        continue;

    printf("%d ", i);
}
```

Output:

```
1 3 5 7 9
```

When `i` is even, `continue` skips the rest of the loop body for _that iteration only_ and jumps to the update step (`i++`). The loop itself keeps running.

The distinction is important: `break` ends the loop, `continue` merely skips one pass through it.

---

## 5. Nested Loops — The Foundation of 2D Thinking

A loop placed inside another loop creates a _nested_ structure. The outer loop controls one dimension; the inner loop runs completely for each step of the outer loop.

```c
for (int i = 1; i <= 3; i++)
{
    for (int j = 1; j <= 3; j++)
    {
        printf("%d ", i * j);
    }
    printf("\n");
}
```

Output:

```
1 2 3
2 4 6
3 6 9
```

Think of it this way: `i` is the row, `j` is the column. For each row, you traverse all columns. This mental model maps _directly_ onto how 2D arrays and matrices are accessed in memory.

---

### Why Nested Loops Matter Beyond Printing Patterns

Time complexity in algorithms is almost always determined by how loops are structured:

|Loop Structure|Time Complexity|Example|
|---|---|---|
|Single loop|O(n)|Linear Search, array traversal|
|Two nested loops|O(n²)|Bubble Sort, Selection Sort|
|Three nested loops|O(n³)|Naive Matrix Multiplication|

When you analyse an algorithm and ask _"how fast is this?"_, you are largely asking _"how many loops are nested, and how many iterations does each perform?"_. This chapter is the foundation of that entire analysis.

---

## 6. Common Logic Mistakes — Why Programs Freeze or Give Wrong Answers

Syntax errors are caught by the compiler. Logic errors are not. These are the ones that cost marks.

**Infinite loop from missing update:**

```c
int i = 0;
while (i < 5)
{
    printf("%d ", i);
    // forgot i++  →  loop runs forever
}
```

**Off-by-one error:**

```c
for (int i = 0; i <= n; i++)   // wrong — accesses one element beyond the array
for (int i = 0; i < n; i++)    // correct
```

**Missing braces:**

```c
if (x > 0)
    printf("Positive\n");
    count++;    // always runs — not inside if
```

**Assignment instead of comparison:**

```c
if (a = 5)    // assigns 5 to a, always true
if (a == 5)   // comparison — what you meant
```

**Forgetting to update input inside `while`:**

```c
while (num != -1)
{
    printf("Got: %d\n", num);
    // forgot scanf again — infinite loop
}
```

> **Diagnostic rule:** If your program freezes, the first thing you check is the loop — specifically its condition and its update step. Nine times out of ten, the problem is there.

---

## Chapter Summary

|Concept|When to Use It|
|---|---|
|`if / else if / else`|Multiple conditions, different paths|
|`switch`|Single variable, multiple fixed values|
|`for` loop|Number of iterations known in advance|
|`while` loop|Iteration count unknown, condition-driven|
|`do-while`|Body must execute at least once (menus)|
|`break`|Exit a loop or switch early|
|`continue`|Skip current iteration, resume loop|
|Nested loops|2D traversal; determines time complexity|

---

> **A note on where this is going:** Every sorting algorithm, every search, every graph traversal you will study in DSA is built from exactly these constructs — conditions and loops, combined with careful thought about when to stop, when to skip, and when to go deeper. Master the behaviour described in this chapter, not just the syntax, and algorithms will feel like logical extensions rather than new material to memorise.

---

_Next Chapter →_ **Functions: Writing Code That Is Reusable, Readable, and Correct**