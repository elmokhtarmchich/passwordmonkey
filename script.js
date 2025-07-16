document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const lengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const excludeAmbiguousCheckbox = document.getElementById('exclude-ambiguous');
    const excludeSimilarCheckbox = document.getElementById('exclude-similar');
    const generateBtn = document.getElementById('generate-btn');
    const generatedPassword = document.getElementById('generated-password');
    const copyBtn = document.getElementById('copy-btn');
    const tooltip = document.getElementById('tooltip');

    // Character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguousChars = 'iIlL1!|oO0';
    const similarChars = '0Oo1lI';

    // Update length value display
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Generate password function
    function generatePassword() {
        let length = parseInt(lengthSlider.value);
        let charset = '';
        
        // Build character set based on selected options
        if (uppercaseCheckbox.checked) charset += uppercaseChars;
        if (lowercaseCheckbox.checked) charset += lowercaseChars;
        if (numbersCheckbox.checked) charset += numberChars;
        if (symbolsCheckbox.checked) charset += symbolChars;
        
        // If no character types selected, use all
        if (charset === '') {
            charset = uppercaseChars + lowercaseChars + numberChars + symbolChars;
            uppercaseCheckbox.checked = true;
            lowercaseCheckbox.checked = true;
            numbersCheckbox.checked = true;
        }
        
        // Remove ambiguous characters if option is checked
        if (excludeAmbiguousCheckbox.checked) {
            charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }
        
        // Remove similar characters if option is checked
        if (excludeSimilarCheckbox.checked) {
            charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
        }
        
        // Generate password
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        return password;
    }

    // Calculate password strength
    function calculateStrength(password) {
        let strength = 0;
        const length = password.length;
        
        // Length contributes up to 50% of the score
        strength += Math.min(length / 50 * 50, 50);
        
        // Character variety contributes up to 50% of the score
        let varietyScore = 0;
        if (/[A-Z]/.test(password)) varietyScore += 10;
        if (/[a-z]/.test(password)) varietyScore += 10;
        if (/[0-9]/.test(password)) varietyScore += 10;
        if (/[^A-Za-z0-9]/.test(password)) varietyScore += 20;
        
        strength += varietyScore;
        
        // Cap at 100
        strength = Math.min(strength, 100);
        
        return strength;
    }

    // Update strength display
    function updateStrengthDisplay(password) {
        const strength = calculateStrength(password);
        const passwordContainer = document.querySelector('.bg-white.border.border-gray-300');
        
        // Remove existing strength classes
        passwordContainer.classList.remove(
            'border-red-500', 'border-yellow-500', 'border-green-500',
            'bg-red-50', 'bg-yellow-50', 'bg-green-50'
        );
        
        // Add appropriate strength classes
        if (strength < 30) {
            passwordContainer.classList.add('border-red-500', 'bg-red-50');
        } else if (strength < 70) {
            passwordContainer.classList.add('border-yellow-500', 'bg-yellow-50');
        } else {
            passwordContainer.classList.add('border-green-500', 'bg-green-50');
        }
    }

    // Function to handle changes and generate password
    function handleParameterChange() {
        const password = generatePassword();
        generatedPassword.textContent = password;
        updateStrengthDisplay(password);
    }

    // Add event listeners to input elements
    lengthSlider.addEventListener('input', handleParameterChange);
    uppercaseCheckbox.addEventListener('change', handleParameterChange);
    lowercaseCheckbox.addEventListener('change', handleParameterChange);
    numbersCheckbox.addEventListener('change', handleParameterChange);
    symbolsCheckbox.addEventListener('change', handleParameterChange);
    excludeAmbiguousCheckbox.addEventListener('change', handleParameterChange);
    excludeSimilarCheckbox.addEventListener('change', handleParameterChange);

    // Generate password on button click
    generateBtn.addEventListener('click', function() {
        handleParameterChange();
    });

    // Copy password to clipboard
    copyBtn.addEventListener('click', function() {
        if (generatedPassword.textContent === 'Click Generate') return;
        
        navigator.clipboard.writeText(generatedPassword.textContent).then(function() {
            tooltip.classList.add('tooltip-visible');
            setTimeout(function() {
                tooltip.classList.remove('tooltip-visible');
            }, 2000);
        });
    });

    // Generate initial password on page load
    generateBtn.click();
});
document.addEventListener('DOMContentLoaded', function() {
    // Copy password to clipboard
    copyBtn.addEventListener('click', function() {
        if (generatedPassword.textContent === 'Click Generate') return;
        
        navigator.clipboard.writeText(generatedPassword.textContent).then(function() {
            tooltip.classList.add('tooltip-visible');
            setTimeout(function() {
                tooltip.classList.remove('tooltip-visible');
            }, 2000);
        });
    });

    // Generate initial password on page load
    generateBtn.click();
});
