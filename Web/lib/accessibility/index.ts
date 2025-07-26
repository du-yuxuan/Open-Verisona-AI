// Accessibility utilities and WCAG compliance helpers
// Focused on supporting underrepresented and low-income students

/**
 * WCAG 2.1 AA Compliance Utilities
 * Supporting diverse students with varying abilities and technology access
 */

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof window === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management for single-page navigation
export const manageFocus = {
  setFocus: (element: HTMLElement | string, options?: FocusOptions) => {
    const target = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;
    
    if (target) {
      target.focus(options);
      // Announce focus change for context
      const label = target.getAttribute('aria-label') || 
                   target.textContent?.trim() || 
                   'New section focused';
      announceToScreenReader(`Navigated to: ${label}`);
    }
  },

  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }
};

// Color contrast and visual accessibility
export const colorContrast = {
  // WCAG AA compliant color combinations for different backgrounds
  getAccessibleColor: (backgroundColor: string): string => {
    // Simplified contrast calculation - in production use a proper contrast library
    const colors = {
      light: '#1f2937', // Dark gray for light backgrounds
      dark: '#f9fafb',  // Light gray for dark backgrounds
      primary: '#ffffff', // White for primary colors
      secondary: '#1f2937' // Dark for secondary colors
    };
    
    return colors.light;
  },

  // High contrast mode detection
  isHighContrastMode: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Reduced motion detection
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  handleArrowNavigation: (
    event: KeyboardEvent, 
    items: HTMLElement[], 
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        onIndexChange(nextIndex);
        items[nextIndex]?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        onIndexChange(prevIndex);
        items[prevIndex]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        const lastIndex = items.length - 1;
        onIndexChange(lastIndex);
        items[lastIndex]?.focus();
        break;
    }
  },

  // Skip to main content
  createSkipLink: (): HTMLElement => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        // Remove tabindex after focus
        setTimeout(() => mainContent.removeAttribute('tabindex'), 100);
      }
    });
    
    return skipLink;
  }
};

// Form accessibility helpers
export const formAccessibility = {
  // Enhanced form validation with screen reader support
  announceFormError: (fieldName: string, error: string) => {
    announceToScreenReader(`Error in ${fieldName}: ${error}`, 'assertive');
  },

  announceFormSuccess: (message: string) => {
    announceToScreenReader(`Success: ${message}`, 'polite');
  },

  // Progress announcement for multi-step forms
  announceProgress: (currentStep: number, totalSteps: number, stepName?: string) => {
    const stepInfo = stepName ? ` - ${stepName}` : '';
    announceToScreenReader(
      `Step ${currentStep} of ${totalSteps}${stepInfo}`, 
      'polite'
    );
  },

  // Help text for complex forms
  createFieldHelp: (fieldId: string, helpText: string, isError = false): string => {
    const helpId = `${fieldId}-help`;
    const existingHelp = document.getElementById(helpId);
    
    if (existingHelp) {
      existingHelp.textContent = helpText;
      existingHelp.className = isError 
        ? 'text-sm text-destructive mt-1' 
        : 'text-sm text-muted-foreground mt-1';
    } else {
      const helpElement = document.createElement('div');
      helpElement.id = helpId;
      helpElement.textContent = helpText;
      helpElement.className = isError 
        ? 'text-sm text-destructive mt-1' 
        : 'text-sm text-muted-foreground mt-1';
      
      const field = document.getElementById(fieldId);
      if (field && field.parentNode) {
        field.parentNode.appendChild(helpElement);
        field.setAttribute('aria-describedby', helpId);
      }
    }
    
    return helpId;
  }
};

// Language and internationalization helpers
export const languageSupport = {
  // Common language attribute helper
  setLanguage: (element: HTMLElement, lang: string) => {
    element.setAttribute('lang', lang);
  },

  // Direction support for RTL languages
  setDirection: (element: HTMLElement, dir: 'ltr' | 'rtl') => {
    element.setAttribute('dir', dir);
  },

  // Pronounciation hints for screen readers
  addPronunciationHint: (element: HTMLElement, pronunciation: string) => {
    element.setAttribute('aria-label', `${element.textContent} (pronounced ${pronunciation})`);
  }
};

// Mobile and touch accessibility
export const touchAccessibility = {
  // Ensure minimum touch target size (44px)
  ensureMinTouchTarget: (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);
    const width = parseInt(computedStyle.width);
    const height = parseInt(computedStyle.height);
    
    if (width < 44 || height < 44) {
      element.style.minWidth = '44px';
      element.style.minHeight = '44px';
      element.style.display = element.style.display || 'inline-flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
    }
  },

  // Add touch-friendly spacing
  addTouchSpacing: (element: HTMLElement) => {
    element.style.margin = '8px';
  }
};

// Emergency accessibility features for low-resource devices
export const lowResourceSupport = {
  // Simplified interface mode
  enableSimplifiedMode: () => {
    document.body.classList.add('simplified-mode');
    // Reduce animations, simplify layouts
    const style = document.createElement('style');
    style.textContent = `
      .simplified-mode * {
        animation: none !important;
        transition: none !important;
      }
      .simplified-mode .complex-animation {
        display: none !important;
      }
      .simplified-mode .decorative-element {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  },

  // Battery-conscious mode
  enableBatterySaverMode: () => {
    document.body.classList.add('battery-saver');
    // Reduce visual effects, disable auto-refresh
    const style = document.createElement('style');
    style.textContent = `
      .battery-saver {
        filter: contrast(1.1) brightness(0.9);
      }
      .battery-saver .energy-intensive {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
};

// Accessibility testing helpers (development only)
export const a11yTesting = {
  // Quick accessibility audit
  auditPage: () => {
    const issues: string[] = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        issues.push(`Input missing label: ${input.id || input.name || 'unnamed'}`);
      }
    });
    
    // Check for heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let prevLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level > prevLevel + 1) {
        issues.push(`Heading hierarchy skip detected: ${heading.textContent}`);
      }
      prevLevel = level;
    });
    
    if (issues.length === 0) {
      console.log('✅ No obvious accessibility issues found');
    } else {
      console.warn('⚠️ Accessibility issues found:', issues);
    }
    
    return issues;
  }
};

// Export all utilities
export default {
  announceToScreenReader,
  manageFocus,
  colorContrast,
  keyboardNavigation,
  formAccessibility,
  languageSupport,
  touchAccessibility,
  lowResourceSupport,
  a11yTesting
};