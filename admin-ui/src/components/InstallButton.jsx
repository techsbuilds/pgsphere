import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import logo from '../assets/logo1.png';

const InstallButton = () => {
  const { isInstallable, isInstalled, installApp, isIOSSafari } = usePWA();

  // Don't show if already installed or not installable
  if (isInstalled || (!isInstallable && !isIOSSafari)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={installApp}
        className="bg-gradient-to-r from-[#374856] to-[#40505E] text-white pl-2 pr-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-0.5"
        title={isIOSSafari ? "Add to Home Screen" : "Install Pgsphere App"}
      >
        <img src={logo} alt="Pgsphere" className="h-5 w-5 rounded" />
        {isIOSSafari ? (
          <Smartphone className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="text-sm font-medium whitespace-nowrap">
          {isIOSSafari ? "Add to Home" : "Install App"}
        </span>
        
        {/* Pulse animation ring */}
        <div className="absolute inset-0 rounded-full bg-[#374856] opacity-30 animate-ping"></div>
      </button>
    </div>
  );
};

export default InstallButton;
