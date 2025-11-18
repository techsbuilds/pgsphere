import { X, Download } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import logo from '../assets/pgapplogowithwhite.jpg';

const InstallBanner = () => {
  const { showInstallBanner, installApp, dismissBanner, isIOSSafari } = usePWA();

  if (!showInstallBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[#202947] to-[#202947] text-white shadow-lg border-b">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center ml-0 md:ml-50 space-x-3">
          <div className="flex-shrink-0">
            <img src={logo} alt="Pgsphere" className="h-10 w-10 rounded-lg object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Install Pgsphere App
            </p>
            <p className="text-xs text-gray-200 mt-1">
              {isIOSSafari 
                ? "Tap the share button and select 'Add to Home Screen'" 
                : "Get the full app experience with offline access"
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={installApp}
            className="bg-white text-[#202947] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Install</span>
          </button>
          <button
            onClick={dismissBanner}
            className="text-gray-300 hover:text-white transition-colors duration-200 p-1"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
