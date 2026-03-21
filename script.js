// Material Design 3 PasswordMonkey Script

function init() {
    // --- DOM Elements ---
    const lengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const excludeAmbiguousCheckbox = document.getElementById('exclude-ambiguous');
    const excludeSimilarCheckbox = document.getElementById('exclude-similar');
    const generateBtn = document.getElementById('generate-btn');
    const generatedPasswordDiv = document.getElementById('generated-password');
    const passwordContainer = document.getElementById('password-container');
    const passwordGenerator = document.getElementById('password-generator');
    const copyBtn = document.getElementById('copy-btn');
    const tooltip = document.getElementById('tooltip');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const installPwaBtn = document.getElementById('install-pwa-btn');
    const strengthText = document.getElementById('strength-text');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const qrCodeBtn = document.getElementById('qr-code-btn');
    const qrCodeModal = document.getElementById('qr-code-modal');
    const closeQrModalBtn = document.getElementById('close-qr-modal-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');
    let deferredPrompt;

    // --- Mobile Menu Toggle ---
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            
            // Toggle icon between bars and times
            if (isHidden) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        });
    }

    // --- QR Code Modal ---
    if (qrCodeBtn) {
        qrCodeBtn.addEventListener('click', () => {
            const password = generatedPasswordDiv.textContent;
            
            if (password === 'Click Generate' || password === 'Select options') {
                alert('Please generate a password first.');
                return;
            }

            // Check if QRCode.js library is available
            if (typeof QRCode === 'undefined') {
                console.error('QRCode.js library not loaded. Please include it in your HTML.');
                alert('QR Code functionality is currently unavailable. Please try again later.');
                return;
            }
            
            // Clear previous QR code
            qrCodeContainer.innerHTML = '';
            
            // Generate new QR code using qrcode.js
            try {
                const isDarkMode = document.documentElement.classList.contains('dark');
                new QRCode(qrCodeContainer, {
                    text: password,
                    width: 200,
                    height: 200,
                    colorDark: isDarkMode ? '#ffffff' : '#000000',
                    colorLight: isDarkMode ? '#1f2937' : '#ffffff', // Matches dark:bg-gray-800
                    correctLevel: QRCode.CorrectLevel.H
                });
            } catch (error) {
                console.error('QR Code generation failed:', error);
                qrCodeContainer.innerHTML = '<p class="text-red-500">Failed to generate QR code</p>';
            }
            
            qrCodeModal.classList.remove('hidden');
        });
    }
    
    if (closeQrModalBtn) {
        closeQrModalBtn.addEventListener('click', () => {
            qrCodeModal.classList.add('hidden');
        });
    }
    
    // Close QR modal if clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === qrCodeModal) {
            qrCodeModal.classList.add('hidden');
        }
    });

    // --- PWA Installation ---
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installPwaBtn.classList.remove('hidden');
    });

    installPwaBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installPwaBtn.classList.add('hidden');
            }
            deferredPrompt = null;
        }
    });

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js');
    }

    // --- Character Sets ---
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguousChars = 'iIlL1!|oO0';
    const similarChars = '0Oo1lI';

    // --- Functions ---

    function generatePassword() {
        let length = parseInt(lengthSlider.value);
        let charset = '';
        if (uppercaseCheckbox.checked) charset += uppercaseChars;
        if (lowercaseCheckbox.checked) charset += lowercaseChars;
        if (numbersCheckbox.checked) charset += numberChars;
        if (symbolsCheckbox.checked) charset += symbolChars;
        if (charset === '') {
            charset = uppercaseChars + lowercaseChars + numberChars + symbolChars;
            [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox].forEach(cb => cb.checked = true);
        }
        if (excludeAmbiguousCheckbox.checked) {
            charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }
        if (excludeSimilarCheckbox.checked) {
            charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
        }
        let password = '';
        if (charset.length > 0) {
            const randomValues = new Uint32Array(length);
            window.crypto.getRandomValues(randomValues);
            for (let i = 0; i < length; i++) {
                password += charset[randomValues[i] % charset.length];
            }
        }
        return password;
    }

    function calculateStrength(password) {
        if (password === 'Click Generate' || password === 'Select options') return 0;
        if (!password) return 0;
        
        // Calculate entropy based on character set size and length
        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // Approximate symbol count
        
        // Entropy = log2(charsetSize^length) = length * log2(charsetSize)
        const entropy = password.length * Math.log2(charsetSize);
        
        return entropy;
    }

    function updateStrengthDisplay(password) {
        if (!passwordContainer) return;
        
        const entropy = calculateStrength(password);
        
        // Clear all classes first
        passwordGenerator.classList.remove('strength-weak', 'strength-fair', 'strength-good', 'strength-strong');
        passwordContainer.classList.remove('strength-weak', 'strength-fair', 'strength-good', 'strength-strong');
        strengthText.classList.remove('strength-weak', 'strength-fair', 'strength-good', 'strength-strong');
        strengthText.textContent = '';
        strengthText.style.display = 'none';

        if (entropy === 0) {
            // No password - default state
        } else if (entropy < 32) {
            // Weak: Less than 32 bits of entropy
            passwordGenerator.classList.add('strength-weak');
            passwordContainer.classList.add('strength-weak');
            strengthText.textContent = 'Weak';
            strengthText.classList.add('strength-weak');
            strengthText.style.display = 'inline';
        } else if (entropy < 64) {
            // Fair: 32-64 bits of entropy
            passwordGenerator.classList.add('strength-fair');
            passwordContainer.classList.add('strength-fair');
            strengthText.textContent = 'Fair';
            strengthText.classList.add('strength-fair');
            strengthText.style.display = 'inline';
        } else if (entropy < 128) {
            // Good: 64-128 bits of entropy
            passwordGenerator.classList.add('strength-good');
            passwordContainer.classList.add('strength-good');
            strengthText.textContent = 'Good';
            strengthText.classList.add('strength-good');
            strengthText.style.display = 'inline';
        } else {
            // Strong: 128+ bits of entropy
            passwordGenerator.classList.add('strength-strong');
            passwordContainer.classList.add('strength-strong');
            strengthText.textContent = 'Strong';
            strengthText.classList.add('strength-strong');
            strengthText.style.display = 'inline';
        }
    }

    function handleParameterChange() {
        const password = generatePassword();
        generatedPasswordDiv.textContent = password || 'Select options';
        updateStrengthDisplay(password);
    }

    function setDarkMode(enabled) {
        const isDark = enabled;
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            localStorage.setItem('pm_dark', isDark ? '1' : '0');
        } catch (e) {
            // Ignore localStorage errors (e.g. if disabled)
        }

        if (darkModeIcon) {
            darkModeIcon.classList.remove('fa-moon', 'fa-sun');
            darkModeIcon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
        }
        
        if (typeof updateStrengthDisplay === 'function' && generatedPasswordDiv) {
            updateStrengthDisplay(generatedPasswordDiv.textContent);
        }

        // If QR modal is open, regenerate QR code with new colors
        if (qrCodeModal && !qrCodeModal.classList.contains('hidden')) {
            const password = generatedPasswordDiv.textContent;
            if (password && password !== 'Click Generate' && password !== 'Select options') {
                qrCodeContainer.innerHTML = '';
                try {
                    new QRCode(qrCodeContainer, {
                        text: password,
                        width: 200,
                        height: 200,
                        colorDark: isDark ? '#ffffff' : '#000000',
                        colorLight: isDark ? '#1f2937' : '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } catch (error) {
                    console.error('QR Code regeneration failed:', error);
                    qrCodeContainer.innerHTML = '<p class="text-red-500">Failed to regenerate QR code</p>';
                }
            }
        }
    }
    
    // --- Event Listeners ---
    
    const allCheckboxes = [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox, excludeAmbiguousCheckbox, excludeSimilarCheckbox];
    allCheckboxes.forEach(el => {
        if (el) el.addEventListener('change', handleParameterChange);
    });

    if (lengthSlider) {
        lengthSlider.addEventListener('input', () => {
            lengthValue.textContent = lengthSlider.value;
            handleParameterChange();
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', handleParameterChange);
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const passText = generatedPasswordDiv.textContent;
            if (passText && passText !== 'Click Generate' && passText !== 'Select options') {
                navigator.clipboard.writeText(passText).then(() => {
                    tooltip.classList.add('tooltip-visible');
                    setTimeout(() => tooltip.classList.remove('tooltip-visible'), 2000);
                });
            }
        });
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            setDarkMode(!document.documentElement.classList.contains('dark'));
        });
    }

    // --- Initial State Sync ---
    // The inline script in index.html handles the class. Here we sync the icon.
    const isInitiallyDark = document.documentElement.classList.contains('dark');
    if (darkModeIcon) {
        darkModeIcon.classList.remove('fa-moon', 'fa-sun');
        darkModeIcon.classList.add(isInitiallyDark ? 'fa-sun' : 'fa-moon');
    }

    // --- System Preference Listener ---
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('pm_dark') === null) {
            setDarkMode(e.matches);
        }
    });

    if (document.getElementById('generate-btn')) {
        handleParameterChange();
    }
    
    // JSON-LD structured data
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PasswordMonkey",
    "url": "https://passwordmonkey.org/",
    "logo": "https://passwordmonkey.org/favicon_io/android-chrome-192x192.png",
    "sameAs": [
      "https://twitter.com/yourhandle",
      "https://facebook.com/yourpage"
    ]
  };
  const jsonLdContainer = document.getElementById('jsonld-organization');
  if (jsonLdContainer) jsonLdContainer.textContent = JSON.stringify(orgJsonLd, null, 2);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}