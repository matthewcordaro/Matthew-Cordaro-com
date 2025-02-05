---
title: "React Hooks: useEffect, useState, & useRef in Next.js"
date: 2025/1/28
description: A brief on useEffect, useState, & useRef in React & Next
tag: React, NextJS
author: Matthew Cordaro
---

A brief on React's `useEffect`, `useState`, and `useRef` and how they work in Next.js

---

### `useState`
Manages state in functional components. It allows you to add state to your components by declaring state variables.


#### Usage
```js
const [state, setState] = useState(initialState);
```

#### Behavior
 - When `setState` is called a re-render of the component is triggered, updating the UI based on the new state
 - Synchronous in terms of setting the state
 - React batches updates for performance


#### In Next.js
Works the same as in React, but keep in mind server-side rendering where state might be reset on 
navigation or page refresh.

---

### `useEffect`
Handles side effects in functional components. This includes operations like data fetching, subscriptions, or manually changing the DOM in response to changes in props or state.


#### Usage
```js
useEffect(() => {
    // Side effect code
    return () => {
        // Clean up code if necessary
    };
}, [dependencies]);
```

#### Behavior
Runs after every render by default, but you can control this with the dependency array.
The cleanup function (if provided) runs when the component is about to unmount or when dependencies change.

#### In Next.js
Particularly useful for managing lifecycle events that might be different due to server-side rendering or static generation. For example, you might use `useEffect` to handle effects that should only occur in the browser, not during server rendering.

---

### `useRef`
Provides a way to store mutable values that persist without causing re-renders. It's often used for accessing DOM elements or keeping any mutable value across renders.


#### Usage:
```js
const refContainer = useRef(initialValue);
```

#### Behavior:
`ref.current` is the mutable value you can read from or write to.
Changing `ref.current` does not trigger a re-render which makes it ideal for scenarios like keeping track of timers or storing previous values without causing performance issues.

#### In Next.js: 
Useful in components where you need to interact directly with the DOM, especially after server-side rendering where you might need to adjust elements once they are mounted in the browser.

---

### Bottom Line
In Next.js, these hooks behave fundamentally the same as in React, but you should be mindful of how they interact with Next.js's server-side rendering, static generation, and client-side navigation features.

#### Reactivity
- `useState` triggers re-renders when the state changes
- `useEffect` can react to state or prop changes but doesn't inherently cause re-renders
- `useRef` does not cause re-renders when its value changes

#### Purpose
- `useState` for state management
- `useEffect` for side effects management
- `useRef` for mutable values that should not trigger UI updates or for accessing DOM nodes

#### Lifecycle
- `useEffect` manages lifecycle events like mounting, updating, and unmounting
- `useState` and `useRef` don't have lifecycle implications directly but can influence lifecycle hooks via `useEffect`
