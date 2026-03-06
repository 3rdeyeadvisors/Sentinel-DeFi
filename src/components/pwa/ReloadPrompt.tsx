import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, X } from "lucide-react";

function ReloadPrompt() {
  const swResult = useRegisterSW({
    onRegistered(r) {
    },
    onRegisterError(error) {
    },
  });

  const {
    offlineReady: [offlineReady, setOfflineReady] = [false, () => {}],
    needRefresh: [needRefresh, setNeedRefresh] = [false, () => {}],
    updateServiceWorker,
  } = swResult || {};

  const close = React.useCallback(() => {
    if (setOfflineReady) setOfflineReady(false);
    if (setNeedRefresh) setNeedRefresh(false);
  }, [setOfflineReady, setNeedRefresh]);

  // Automatic update check on focus/visibility change
  React.useEffect(() => {
    const checkUpdate = () => {
      // updateServiceWorker() returns a promise that resolves when the update is checked
      if (typeof updateServiceWorker === 'function') {
        updateServiceWorker();
      }
    };

    window.addEventListener('focus', checkUpdate);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkUpdate();
      }
    });

    // Check for updates every 5 minutes
    const interval = setInterval(checkUpdate, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', checkUpdate);
      document.removeEventListener('visibilitychange', checkUpdate);
      clearInterval(interval);
    };
  }, [updateServiceWorker]);

  // Handle automatic reload when the service worker updates
  React.useEffect(() => {
    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      // Reload the page to use the new service worker
      window.location.reload();
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  React.useEffect(() => {
    if (offlineReady) {
      toast.success("App ready to work offline", {
        action: {
          label: "Close",
          onClick: () => close(),
        },
      });
    }
  }, [offlineReady, close]);

  React.useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] p-3 rounded-lg bg-white/3 border border-white/8 shadow-cosmic animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-consciousness">
          <span>App ready to work offline</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => close()}
            className="font-consciousness gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReloadPrompt;
