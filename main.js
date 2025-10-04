// Stellar Stories - Main JavaScript
// All functionality for the website including navigation, theme toggle, lightbox, read-aloud, etc.

class StellarStories {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        // Initialize all components
        this.initNavigation();
        this.initThemeToggle();
        this.initSmoothScroll();
        this.initGalleryLightbox();
        this.initAccordion();
        this.initReadAloud();
        this.initFontControls();
        this.initKeyboardNavigation();
        
        console.log('Stellar Stories initialized successfully! 🌟');
    }

    // Navigation functionality
    initNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!navToggle || !navMenu) return;

        // Mobile menu toggle
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('open');
            navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', !isOpen);
        });

        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Handle escape key for mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    // Theme toggle functionality
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
        
        if (!themeToggle) return;

        // Check for saved theme preference or default to 'dark'
        const currentTheme = localStorage.getItem('theme') || 
                           (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        
        html.setAttribute('data-theme', currentTheme);
        this.updateThemeToggle(themeToggle, currentTheme);

        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeToggle(themeToggle, newTheme);
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                html.setAttribute('data-theme', newTheme);
                this.updateThemeToggle(themeToggle, newTheme);
            }
        });
    }

    updateThemeToggle(toggle, theme) {
        const icon = toggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        toggle.setAttribute('aria-pressed', theme === 'light');
        toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }

    // Smooth scrolling for navigation links
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Gallery lightbox functionality
    initGalleryLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxOverlay = document.querySelector('.lightbox-overlay');

        if (!lightbox) return;

        // Track focusable elements for focus trap
        let focusableElements = [];
        let firstFocusable = null;
        let lastFocusable = null;

        // Open lightbox
        galleryItems.forEach(item => {
            const openLightbox = () => {
                const img = item.querySelector('.gallery-image');
                const caption = item.querySelector('.gallery-caption');
                
                if (img) {
                    lightboxImage.src = img.src;
                    lightboxImage.alt = img.alt;
                    lightboxCaption.textContent = caption ? caption.textContent : '';
                    
                    lightbox.classList.add('open');
                    lightbox.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden';
                    
                    // Set up focus trap
                    this.setupFocusTrap(lightbox);
                    lightboxClose.focus();
                }
            };

            item.addEventListener('click', openLightbox);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox();
                }
            });
        });

        // Close lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Return focus to the gallery item that opened the lightbox
            const activeGalleryItem = document.querySelector('.gallery-item:focus') || 
                                     document.querySelector('.gallery-item');
            if (activeGalleryItem) {
                activeGalleryItem.focus();
            }
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightboxOverlay) {
            lightboxOverlay.addEventListener('click', closeLightbox);
        }

        // Keyboard controls for lightbox
        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('open')) {
                if (e.key === 'Escape') {
                    closeLightbox();
                } else if (e.key === 'Tab') {
                    this.handleFocusTrap(e, lightbox);
                }
            }
        });
    }

    // Focus trap for modal accessibility
    setupFocusTrap(container) {
        const focusableSelectors = [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        const focusableElements = container.querySelectorAll(focusableSelectors.join(', '));
        this.firstFocusable = focusableElements[0];
        this.lastFocusable = focusableElements[focusableElements.length - 1];
    }

    handleFocusTrap(e, container) {
        if (e.shiftKey) {
            if (document.activeElement === this.firstFocusable) {
                e.preventDefault();
                this.lastFocusable.focus();
            }
        } else {
            if (document.activeElement === this.lastFocusable) {
                e.preventDefault();
                this.firstFocusable.focus();
            }
        }
    }

    // Accordion functionality
    initAccordion() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = document.getElementById(header.getAttribute('aria-controls'));
                const isExpanded = header.getAttribute('aria-expanded') === 'true';

                // Close other accordions (optional - remove if you want multiple open)
                accordionHeaders.forEach(otherHeader => {
                    if (otherHeader !== header) {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        const otherContent = document.getElementById(otherHeader.getAttribute('aria-controls'));
                        if (otherContent) {
                            otherContent.classList.remove('open');
                        }
                    }
                });

                // Toggle current accordion
                header.setAttribute('aria-expanded', !isExpanded);
                if (content) {
                    content.classList.toggle('open', !isExpanded);
                }
            });

            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        });
    }

    // Read aloud functionality using Web Speech API
    initReadAloud() {
        const readAloudBtn = document.getElementById('read-aloud');
        const storyContent = document.getElementById('story-content');
        
        if (!readAloudBtn || !storyContent || !('speechSynthesis' in window)) {
            if (readAloudBtn && !('speechSynthesis' in window)) {
                readAloudBtn.style.display = 'none';
            }
            return;
        }

        let isReading = false;
        let currentUtterance = null;
        let currentParagraph = 0;
        
        const paragraphs = storyContent.querySelectorAll('p, li');
        
        readAloudBtn.addEventListener('click', () => {
            if (isReading) {
                this.stopReading();
            } else {
                this.startReading();
            }
        });

        const startReading = () => {
            if (paragraphs.length === 0) return;
            
            isReading = true;
            currentParagraph = 0;
            storyContent.classList.add('reading');
            readAloudBtn.innerHTML = '<span class="control-icon">⏸️</span> Pause';
            readAloudBtn.setAttribute('aria-label', 'Pause reading');
            
            this.readParagraph(currentParagraph);
        };

        const stopReading = () => {
            isReading = false;
            speechSynthesis.cancel();
            storyContent.classList.remove('reading');
            paragraphs.forEach(p => p.classList.remove('highlight'));
            readAloudBtn.innerHTML = '<span class="control-icon">🔊</span> Listen';
            readAloudBtn.setAttribute('aria-label', 'Read story aloud');
        };

        this.startReading = startReading;
        this.stopReading = stopReading;
    }

    readParagraph(index) {
        const paragraphs = document.querySelectorAll('#story-content p, #story-content li');
        
        if (index >= paragraphs.length) {
            this.stopReading();
            return;
        }

        // Highlight current paragraph
        paragraphs.forEach(p => p.classList.remove('highlight'));
        paragraphs[index].classList.add('highlight');

        const text = paragraphs[index].textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
            paragraphs[index].classList.remove('highlight');
            this.currentParagraph++;
            setTimeout(() => {
                if (this.isReading) {
                    this.readParagraph(this.currentParagraph);
                }
            }, 500);
        };

        utterance.onerror = () => {
            this.stopReading();
        };

        speechSynthesis.speak(utterance);
    }

    // Font size controls
    initFontControls() {
        const increaseBtn = document.getElementById('increase-font');
        const decreaseBtn = document.getElementById('decrease-font');
        const storyContent = document.getElementById('story-content');
        
        if (!increaseBtn || !decreaseBtn || !storyContent) return;

        // Get saved font size or default
        let fontSize = parseInt(localStorage.getItem('fontSize')) || 100;
        this.applyFontSize(fontSize);

        increaseBtn.addEventListener('click', () => {
            fontSize = Math.min(fontSize + 10, 150);
            this.applyFontSize(fontSize);
            localStorage.setItem('fontSize', fontSize);
        });

        decreaseBtn.addEventListener('click', () => {
            fontSize = Math.max(fontSize - 10, 80);
            this.applyFontSize(fontSize);
            localStorage.setItem('fontSize', fontSize);
        });
    }

    applyFontSize(percentage) {
        const storyContent = document.getElementById('story-content');
        if (storyContent) {
            storyContent.style.fontSize = `${percentage}%`;
        }
    }

    // Enhanced keyboard navigation
    initKeyboardNavigation() {
        // Skip to main content
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.focus();
                    main.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Enhance focus visibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// Initialize the application
const app = new StellarStories();

// Service Worker registration for potential PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StellarStories;
}
