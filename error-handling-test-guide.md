# MASTIL Error Handling Testing Guide

This guide explains how to test the new error handling system implemented in MASTIL.

## Features Added

1. **Enhanced Error Boundary**
   - Improved logging of error details
   - Added "Copy Error Details" button for easy error sharing

2. **Global Error Handlers**
   - Added window.onerror handler for uncaught JavaScript errors
   - Added window.onunhandledrejection handler for unhandled promises

3. **Error Formatting Utilities**
   - Created standardized error formatting
   - Added structured error reporting format

## How to Test the Error Handling

### Testing the Error Boundary

1. Create a deliberate error in a component by adding this code to a React component:

```jsx
function BrokenComponent() {
  // This will throw an error when rendered
  throw new Error("Test error from BrokenComponent");
  return <div>This will never render</div>;
}

// Then use it somewhere in your app:
<BrokenComponent />
```

2. When the error occurs:
   - You should see the Error Boundary's fallback UI
   - The "Copy Error Details" button should be displayed
   - Clicking it should copy formatted error details to your clipboard

### Testing Global Error Handlers

1. Add code that triggers an uncaught error:

```javascript
// In the browser console or in a component:
setTimeout(() => {
  nonExistentFunction(); // This will throw an error
}, 1000);
```

2. Add code that creates an unhandled promise rejection:

```javascript
// In the browser console or in a component:
new Promise((resolve, reject) => {
  reject(new Error("Test unhandled promise rejection"));
});
```

3. When these errors occur:
   - Check the browser console
   - You should see formatted error messages with the "=== GLOBAL UNHANDLED ERROR ===" or "=== UNHANDLED PROMISE REJECTION ===" headers
   - The formatted error report should be logged with detailed information

## Debug View

A comprehensive error report should include:

```
JAVASCRIPT ERROR REPORT:
-------------------------
Timestamp: [ISO Date/Time]
Error Message: [Error details]
Error Name: [Error type]
--- Stack Trace ---
[Full stack trace showing call hierarchy]
--- React Component Stack --- (if from ErrorBoundary)
[Component rendering hierarchy]
-------------------------
Game Version: 1.0.4
User Agent: [Browser info]
```

## Benefits

- Developers can now easily copy error details when reporting issues
- The standard error format makes debugging more efficient
- Unhandled errors that previously caused silent failures are now captured 