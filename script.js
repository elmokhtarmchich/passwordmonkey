// Material Design 3 PasswordMonkey Script

document.addEventListener('DOMContentLoaded', function() {
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
            mobileMenu.classList.toggle('hidden');
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
            
            // Clear previous QR code
            qrCodeContainer.innerHTML = '';
            
            // Generate new QR code
            QRCode.toCanvas(qrCodeContainer, password, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, function (error) {
                if (error) {
                    console.error('QR Code generation error:', error);
                    qrCodeContainer.innerHTML = '<p class="text-red-500">Error generating QR code</p>';
                }
            });
            
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
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
            }
        }
        return password;
    }

    function calculateStrength(password) {
        let strength = 0;
        if (!password) return 0;
        const length = password.length;
        strength += Math.min(length / 50 * 50, 50);
        let varietyScore = 0;
        if (/[A-Z]/.test(password)) varietyScore += 10;
        if (/[a-z]/.test(password)) varietyScore += 10;
        if (/[0-9]/.test(password)) varietyScore += 10;
        if (/[^A-Za-z0-9]/.test(password)) varietyScore += 20;
        strength += varietyScore;
        return Math.min(strength, 100);
    }

    function updateStrengthDisplay(password) {
        const strength = calculateStrength(password);
        
        const baseClasses = ['bg-white', 'dark:bg-gray-600', 'border-gray-300', 'dark:border-gray-500'];
        const weakClasses = ['bg-red-100', 'dark:bg-red-900', 'border-red-500'];
        const mediumClasses = ['bg-yellow-100', 'dark:bg-yellow-900', 'border-yellow-500'];
        const strongClasses = ['bg-green-100', 'dark:bg-green-900', 'border-green-500'];
        
        const weakText = ['text-red-400'];
        const mediumText = ['text-yellow-400'];
        const strongText = ['text-green-400'];

        passwordContainer.classList.remove(...baseClasses, ...weakClasses, ...mediumClasses, ...strongClasses);
        strengthText.classList.remove('text-red-400', 'text-yellow-400', 'text-green-400');
        strengthText.textContent = '';
        strengthText.style.display = 'none';

        if (strength === 0) {
             passwordContainer.classList.add(...baseClasses);
        } else if (strength < 30) {
            passwordContainer.classList.add(...weakClasses);
            strengthText.textContent = 'Weak';
            strengthText.classList.add(...weakText);
            strengthText.style.display = 'inline';
        } else if (strength < 70) {
            passwordContainer.classList.add(...mediumClasses);
            strengthText.textContent = 'Medium';
            strengthText.classList.add(...mediumText);
            strengthText.style.display = 'inline';
        } else {
            passwordContainer.classList.add(...strongClasses);
            strengthText.textContent = 'Strong';
            strengthText.classList.add(...strongText);
            strengthText.style.display = 'inline';
        }
    }

    function handleParameterChange() {
        const password = generatePassword();
        generatedPasswordDiv.textContent = password || 'Select options';
        updateStrengthDisplay(password);
    }

    function setDarkMode(enabled) {
        const isDark = document.body.classList.toggle('dark', enabled);
        if (darkModeIcon) {
            darkModeIcon.classList.toggle('fa-moon', isDark);
            darkModeIcon.classList.toggle('fa-sun', !isDark);
        }
        localStorage.setItem('pm_dark', isDark ? '1' : '0');
        updateStrengthDisplay(generatedPasswordDiv.textContent);
    }
    
    // --- Event Listeners ---
    
    const allCheckboxes = [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox, excludeAmbiguousCheckbox, excludeSimilarCheckbox];
    allCheckboxes.forEach(el => el.addEventListener('change', handleParameterChange));

    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
        handleParameterChange();
    });
    
    generateBtn.addEventListener('click', handleParameterChange);

    copyBtn.addEventListener('click', () => {
        const passText = generatedPasswordDiv.textContent;
        if (passText && passText !== 'Click Generate' && passText !== 'Select options') {
            navigator.clipboard.writeText(passText).then(() => {
                tooltip.classList.add('tooltip-visible');
                setTimeout(() => tooltip.classList.remove('tooltip-visible'), 2000);
            });
        }
    });

    darkModeToggle.addEventListener('click', () => {
        setDarkMode(!document.body.classList.contains('dark'));
    });

    // --- Initial Load ---
    const savedDark = localStorage.getItem('pm_dark');
    setDarkMode(savedDark === null ? true : savedDark === '1');

    // Generate password only if on the main page
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
  document.getElementById('jsonld-organization').textContent = JSON.stringify(orgJsonLd, null, 2);
});
