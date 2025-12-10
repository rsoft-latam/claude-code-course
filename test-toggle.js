/**
 * Test suite for toggle button functionality
 * This can be run in a browser console or with a testing framework
 */

// Simulate the toggle functionality
function testToggleButtons() {
    const results = [];

    // Test 1: Initial state should have Preview active
    console.log('Test 1: Checking initial state...');
    const initialActiveButton = document.querySelector('.toggle-button.active');
    const initialActivePanel = document.querySelector('.content-panel.active');

    if (initialActiveButton && initialActiveButton.dataset.tab === 'preview') {
        results.push('✓ Test 1 PASSED: Preview button is active initially');
    } else {
        results.push('✗ Test 1 FAILED: Preview button should be active initially');
    }

    if (initialActivePanel && initialActivePanel.id === 'preview-panel') {
        results.push('✓ Test 1 PASSED: Preview panel is visible initially');
    } else {
        results.push('✗ Test 1 FAILED: Preview panel should be visible initially');
    }

    // Test 2: Switch to Code tab
    console.log('Test 2: Switching to Code tab...');
    switchTab('code');

    setTimeout(() => {
        const codeButton = document.querySelector('[data-tab="code"]');
        const codePanel = document.getElementById('code-panel');
        const previewButton = document.querySelector('[data-tab="preview"]');
        const previewPanel = document.getElementById('preview-panel');

        if (codeButton && codeButton.classList.contains('active')) {
            results.push('✓ Test 2 PASSED: Code button is active after switch');
        } else {
            results.push('✗ Test 2 FAILED: Code button should be active after switch');
        }

        if (codePanel && codePanel.classList.contains('active')) {
            results.push('✓ Test 2 PASSED: Code panel is visible after switch');
        } else {
            results.push('✗ Test 2 FAILED: Code panel should be visible after switch');
        }

        if (previewButton && !previewButton.classList.contains('active')) {
            results.push('✓ Test 2 PASSED: Preview button is inactive after switch');
        } else {
            results.push('✗ Test 2 FAILED: Preview button should be inactive after switch');
        }

        if (previewPanel && !previewPanel.classList.contains('active')) {
            results.push('✓ Test 2 PASSED: Preview panel is hidden after switch');
        } else {
            results.push('✗ Test 2 FAILED: Preview panel should be hidden after switch');
        }

        // Test 3: Switch back to Preview
        console.log('Test 3: Switching back to Preview tab...');
        switchTab('preview');

        setTimeout(() => {
            const previewButtonCheck = document.querySelector('[data-tab="preview"]');
            const previewPanelCheck = document.getElementById('preview-panel');

            if (previewButtonCheck && previewButtonCheck.classList.contains('active')) {
                results.push('✓ Test 3 PASSED: Preview button is active after switching back');
            } else {
                results.push('✗ Test 3 FAILED: Preview button should be active after switching back');
            }

            if (previewPanelCheck && previewPanelCheck.classList.contains('active')) {
                results.push('✓ Test 3 PASSED: Preview panel is visible after switching back');
            } else {
                results.push('✗ Test 3 FAILED: Preview panel should be visible after switching back');
            }

            // Print results
            console.log('\n=== Toggle Button Test Results ===');
            results.forEach(result => console.log(result));

            const passed = results.filter(r => r.includes('PASSED')).length;
            const failed = results.filter(r => r.includes('FAILED')).length;
            console.log(`\nTotal: ${passed} passed, ${failed} failed`);

            if (failed === 0) {
                console.log('🎉 All tests passed!');
            } else {
                console.log('⚠️ Some tests failed. Please review the implementation.');
            }
        }, 100);
    }, 100);
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testToggleButtons, 500);
    });
} else {
    setTimeout(testToggleButtons, 500);
}
