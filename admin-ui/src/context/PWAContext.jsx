import { createContext, useContext, useEffect, useState } from 'react';

const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    const checkIfInstalled = () => {
      // Check if app is in standalone mode (installed)
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsInstalled(true);
        return;
      }

      // Check for related applications (Android)
      if ('getInstalledRelatedApps' in navigator) {
        navigator.getInstalledRelatedApps().then((apps) => {
          if (apps.length > 0) {
            setIsInstalled(true);
          }
        });
      }
    };

    checkIfInstalled();
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show install banner after a delay if not installed
      if (!isInstalled) {
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 3000); // Show after 3 seconds
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // In development, always show banner for testing after a delay
    let devTimer;
    if (import.meta.env.DEV && !isInstalled) {
      devTimer = setTimeout(() => {
        setIsInstallable(true);
        setShowInstallBanner(true);
      }, 2000); // Show after 2 seconds in development
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (devTimer) {
        clearTimeout(devTimer);
      }
    };
  }, [isInstalled]);

  // Check for iOS Safari
  const isIOSSafari = () => {
    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad|iPhone|iPod/);
    const webkit = !!ua.match(/WebKit/);
    const iOSSafari = iOS && webkit && !ua.match(/CriOS/);
    return iOSSafari;
  };

  // Install app function
  const installApp = async () => {
    if (!deferredPrompt) {
      // If no prompt available, show iOS instructions for Safari users
      if (isIOSSafari()) {
        setShowIOSInstructions(true);
        return;
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    // Store in localStorage to not show again for this session
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const dismissIOSInstructions = () => {
    setShowIOSInstructions(false);
  };

  // Force show functions for testing
  const forceShowBanner = () => {
    setShowInstallBanner(true);
  };

  const forceShowIOSInstructions = () => {
    setShowIOSInstructions(true);
  };

  // Check if banner was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      // Show banner again after 24 hours
      if (now - dismissedTime < 24 * 60 * 60 * 1000) {
        setShowInstallBanner(false);
      }
    }
  }, []);

  const value = {
    isInstallable,
    isInstalled,
    showInstallBanner,
    showIOSInstructions,
    installApp,
    dismissBanner,
    dismissIOSInstructions,
    forceShowBanner,
    forceShowIOSInstructions,
    isIOSSafari: isIOSSafari()
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};
