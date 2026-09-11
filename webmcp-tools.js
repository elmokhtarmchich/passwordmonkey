// WebMCP Tools for PasswordMonkey
// Registers tools for AI agents to interact with the password generator

(function() {
    'use strict';

    // Wait for document to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerWebMCPTools);
    } else {
        registerWebMCPTools();
    }

    async function registerWebMCPTools() {
        // Check if WebMCP API is available
        if (!('modelContext' in document)) {
            console.log('WebMCP API not available');
            return;
        }

        try {
            // Tool 1: Generate Password
            await document.modelContext.registerTool({
                name: 'generate_password',
                description: 'Generate a cryptographically secure random password with customizable options. Use this tool when a user requests creating or generating a password.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        length: {
                            type: 'integer',
                            description: 'Password length in characters (4-50)',
                            minimum: 4,
                            maximum: 50,
                            default: 16
                        },
                        includeUppercase: {
                            type: 'boolean',
                            description: 'Include uppercase letters (A-Z)',
                            default: true
                        },
                        includeLowercase: {
                            type: 'boolean',
                            description: 'Include lowercase letters (a-z)',
                            default: true
                        },
                        includeNumbers: {
                            type: 'boolean',
                            description: 'Include numbers (0-9)',
                            default: true
                        },
                        includeSymbols: {
                            type: 'boolean',
                            description: 'Include special symbols (!@#$%^&*)',
                            default: true
                        },
                        excludeAmbiguous: {
                            type: 'boolean',
                            description: 'Exclude ambiguous characters (i, l, 1, |, o, O, 0)',
                            default: false
                        },
                        excludeSimilar: {
                            type: 'boolean',
                            description: 'Exclude similar-looking characters (0, O, o, 1, l, I)',
                            default: false
                        }
                    },
                    required: []
                },
                annotations: {
                    readOnlyHint: false,
                    untrustedContentHint: false,
                    consequentialHint: false
                },
                execute: async (input) => {
                    // Access the global password generation function
                    if (window.passwordGeneratorAPI && window.passwordGeneratorAPI.generate) {
                        const result = window.passwordGeneratorAPI.generate(input);
                        return result;
                    }
                    return 'Error: Password generator not available';
                }
            });

            // Tool 2: Copy Password to Clipboard
            await document.modelContext.registerTool({
                name: 'copy_password',
                description: 'Copy the currently generated password to the clipboard. Use this when a user wants to copy or save the generated password.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                },
                annotations: {
                    readOnlyHint: false,
                    untrustedContentHint: true,
                    consequentialHint: false
                },
                execute: async () => {
                    if (window.passwordGeneratorAPI && window.passwordGeneratorAPI.copy) {
                        return await window.passwordGeneratorAPI.copy();
                    }
                    return 'Error: Copy function not available';
                }
            });

            // Tool 3: Get Password Strength
            await document.modelContext.registerTool({
                name: 'get_password_strength',
                description: 'Get the strength analysis of a password including entropy calculation and security assessment.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        password: {
                            type: 'string',
                            description: 'The password to analyze'
                        }
                    },
                    required: ['password']
                },
                annotations: {
                    readOnlyHint: true,
                    untrustedContentHint: false,
                    consequentialHint: false
                },
                execute: async ({ password }) => {
                    if (window.passwordGeneratorAPI && window.passwordGeneratorAPI.calculateStrength) {
                        return window.passwordGeneratorAPI.calculateStrength(password);
                    }
                    return 'Error: Strength calculation not available';
                }
            });

            // Tool 4: Generate QR Code
            await document.modelContext.registerTool({
                name: 'generate_qr_code',
                description: 'Generate a QR code for the current password to facilitate mobile sharing and scanning.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        password: {
                            type: 'string',
                            description: 'The password to encode in the QR code'
                        }
                    },
                    required: ['password']
                },
                annotations: {
                    readOnlyHint: false,
                    untrustedContentHint: true,
                    consequentialHint: false
                },
                execute: async ({ password }) => {
                    if (window.passwordGeneratorAPI && window.passwordGeneratorAPI.generateQR) {
                        return await window.passwordGeneratorAPI.generateQR(password);
                    }
                    return 'Error: QR code generation not available';
                }
            });

            // Tool 5: Validate Password Options
            await document.modelContext.registerTool({
                name: 'validate_password_options',
                description: 'Validate password generation options to ensure they will produce a strong, usable password.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        length: {
                            type: 'integer',
                            description: 'Password length'
                        },
                        options: {
                            type: 'object',
                            description: 'Character type options',
                            properties: {
                                uppercase: { type: 'boolean' },
                                lowercase: { type: 'boolean' },
                                numbers: { type: 'boolean' },
                                symbols: { type: 'boolean' }
                            }
                        }
                    },
                    required: ['length']
                },
                annotations: {
                    readOnlyHint: true,
                    untrustedContentHint: false,
                    consequentialHint: false
                },
                execute: async (input) => {
                    if (window.passwordGeneratorAPI && window.passwordGeneratorAPI.validateOptions) {
                        return window.passwordGeneratorAPI.validateOptions(input);
                    }
                    return 'Error: Validation not available';
                }
            });

            console.log('WebMCP tools registered successfully:', 
                await document.modelContext.getTools());

        } catch (error) {
            console.error('Error registering WebMCP tools:', error);
        }
    }

    // Expose API for tools to use
    window.passwordGeneratorAPI = window.passwordGeneratorAPI || {};

})();