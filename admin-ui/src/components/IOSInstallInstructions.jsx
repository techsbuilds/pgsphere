import { X, Share, Plus, Smartphone } from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import logo from '../assets/pgapplogowithwhite.jpg';

const IOSInstallInstructions = () => {
  const { showIOSInstructions, dismissIOSInstructions } = usePWA();

  if (!showIOSInstructions) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white bg-opacity-10 p-4 sm:p-6"
      onClick={dismissIOSInstructions}
    >
      <div 
        className="bg-white rounded-xl max-w-sm w-full shadow-2xl mx-2 sm:mx-4 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border">
              <img src={logo} alt="Pgsphere" className="h-6 w-6 rounded object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Install Pgsphere</h3>
              <p className="text-sm text-gray-600">Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={dismissIOSInstructions}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Install Pgsphere on your iPhone or iPad for the best experience:
            </p>
          </div>

          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#202947] text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Share className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-gray-900">Tap the Share button</p>
              </div>
              <p className="text-xs text-gray-600">
                Look for the share icon in your Safari browser (usually at the bottom)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#202947] text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Plus className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-gray-900">Add to Home Screen</p>
              </div>
              <p className="text-xs text-gray-600">
                Scroll down and tap "Add to Home Screen" from the menu
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#202947] text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-gray-900">Confirm Installation</p>
              </div>
              <p className="text-xs text-gray-600">
                Tap "Add" to install Pgsphere on your home screen
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Works offline</li>
              <li>• Faster loading</li>
              <li>• Full-screen experience</li>
              <li>• Easy access from home screen</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={dismissIOSInstructions}
            className="w-full bg-[#202947] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#40505E] transition-colors duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallInstructions;
