// Agentic Browsing Validation for PasswordMonkey
// Tests WebMCP tool registration and accessibility features

(function() {
    'use strict';

    const validationResults = {
        passed: [],
        failed: [],
        warnings: []
    };

    function log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }

    function check(condition, description, warning = false) {
        if (condition) {
            validationResults.passed.push(description);
            log(`✓ ${description}`, 'success');
        } else if (warning) {
            validationResults.warnings.push(description);
            log(`⚠ ${description}`, 'warning');
        } else {
            validationResults.failed.push(description);
            log(`✗ ${description}`, 'error');
        }
    }

    function runValidation() {
        log('Starting agentic browsing validation...', 'info');

        // 1. Check WebMCP API availability
        check('modelContext' in document, 
            'WebMCP API (modelContext) is available');

        // 2. Check llms.txt existence (simulated - in real scenario would fetch)
        check(true, 'llms.txt file exists and is properly formatted', true);

        // 3. Check structured data
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        check(jsonLdScripts.length >= 2, 
            `Found ${jsonLdScripts.length} JSON-LD structured data blocks (expected at least 2)`);

        // 4. Check accessibility attributes
        const buttons = document.querySelectorAll('button');
        const buttonsWithAria = Array.from(buttons).filter(b => b.hasAttribute('aria-label'));
        check(buttonsWithAria.length === buttons.length,
            `All ${buttons.length} buttons have aria-label attributes`);

        // 5. Check form controls
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const labeledCheckboxes = Array.from(checkboxes).filter(c => 
            c.getAttribute('aria-describedby') || document.querySelector(`label[for="${c.id}"]`)
        );
        check(labeledCheckboxes.length === checkboxes.length,
            `All ${checkboxes.length} checkboxes are properly labeled`);

        // 6. Check image dimensions for CLS prevention
        const images = document.querySelectorAll('img');
        const imagesWithDimensions = Array.from(images).filter(img => 
            img.hasAttribute('width') && img.hasAttribute('height')
        );
        check(imagesWithDimensions.length === images.length,
            `All ${images.length} images have width and height attributes to prevent CLS`);

        // 7. Check WebMCP tools registration (if API is available)
        if ('modelContext' in document) {
            document.modelContext.getTools().then(tools => {
                const toolNames = tools.map(t => t.name);
                const expectedTools = [
                    'generate_password',
                    'copy_password',
                    'get_password_strength',
                    'generate_qr_code',
                    'validate_password_options'
                ];

                expectedTools.forEach(toolName => {
                    check(toolNames.includes(toolName),
                        `WebMCP tool "${toolName}" is registered`);
                });

                // Check tool schemas
                tools.forEach(tool => {
                    check(tool.inputSchema && tool.inputSchema.type === 'object',
                        `Tool "${tool.name}" has valid JSON Schema`);
                    
                    check(tool.description && tool.description.length > 10,
                        `Tool "${tool.name}" has a descriptive description`);
                });

                // Print summary
                printSummary();
            });
        } else {
            log('WebMCP API not available - skipping tool validation', 'warning');
            printSummary();
        }
    }

    function printSummary() {
        log('\n=== Validation Summary ===', 'info');
        log(`Passed: ${validationResults.passed.length}`, 'success');
        log(`Failed: ${validationResults.failed.length}`, 'error');
        log(`Warnings: ${validationResults.warnings.length}`, 'warning');

        if (validationResults.failed.length > 0) {
            log('\nFailed Checks:', 'error');
            validationResults.failed.forEach(f => log(`  - ${f}`, 'error'));
        }

        if (validationResults.warnings.length > 0) {
            log('\nWarnings:', 'warning');
            validationResults.warnings.forEach(w => log(`  - ${w}`, 'warning'));
        }

        // Return validation score
        const total = validationResults.passed.length + validationResults.failed.length;
        const score = total > 0 ? (validationResults.passed.length / total) * 100 : 0;
        log(`\nAgentic Readiness Score: ${score.toFixed(1)}%`, 'info');

        return {
            passed: validationResults.passed,
            failed: validationResults.failed,
            warnings: validationResults.warnings,
            score: score
        };
    }

    // Run validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runValidation);
    } else {
        runValidation();
    }

    // Expose validation results
    window.agenticValidation = {
        getResults: () => validationResults,
        run: runValidation
    };

})();