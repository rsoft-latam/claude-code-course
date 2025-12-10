# claude-code-course

## Toggle Buttons Demo

This repository contains a working implementation of toggle buttons that switch between "Preview" and "Code" views.

### Testing the Toggle Buttons

1. Open `index.html` in your web browser
2. You should see two toggle buttons: "Preview" and "Code"
3. Click on each button to switch between views
4. The active button will be highlighted with a white background
5. The corresponding content panel will be displayed

### Features

- **Visual Feedback**: Active button is clearly highlighted
- **Smooth Transitions**: Clean switching between tabs
- **Status Updates**: Real-time feedback shows which tab is active
- **Responsive Design**: Works on different screen sizes
- **Accessible**: Uses semantic HTML and proper ARIA patterns

### Running Tests

To run the automated tests:

1. Open `index.html` in a browser
2. Open the browser's Developer Console (F12)
3. The tests will run automatically and display results
4. Or, load `test-toggle.js` separately to run manual tests

### Implementation Details

The toggle functionality uses:
- Pure JavaScript (no frameworks required)
- CSS classes to manage active states
- Event listeners for button clicks
- DOM manipulation to show/hide content panels

### Known Issues

Fixed in this implementation:
- ✓ Buttons now reliably toggle between states
- ✓ Only one tab can be active at a time
- ✓ Content properly shows/hides based on active tab
- ✓ Visual feedback is consistent and immediate