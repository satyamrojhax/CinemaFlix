"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useLocalStorage } from "@mantine/hooks";
import { Download, Close } from "@/utils/icons";
import { cn } from "@/utils/helpers";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useLocalStorage<boolean>({
    key: "install-prompt-shown",
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds if user hasn't seen it before
      if (!hasPrompted) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [hasPrompted]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      setHasPrompted(true);
    } catch (error) {
      console.error("Error during installation:", error);
      setShowPrompt(false);
    }
  }, [deferredPrompt, setHasPrompted]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setHasPrompted(true);
  }, [setHasPrompted]);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile || !deferredPrompt || !showPrompt || hasPrompted) {
    return null;
  }

  return (
    <Modal
      isOpen={showPrompt}
      onClose={handleDismiss}
      placement="center"
      backdrop="blur"
      size="md"
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center text-center">
              <div className="flex items-center gap-2">
                <Download className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Install CineFlix</h2>
              </div>
            </ModalHeader>
            <ModalBody className="text-center space-y-4">
              <p className="text-default-600">
                Install CineFlix on your device for faster access and a better viewing experience!
              </p>
              <div className="space-y-2 text-sm text-default-500">
                <p>✓ Quick access from your home screen</p>
                <p>✓ Faster loading times</p>
                <p>✓ Offline support for some features</p>
                <p>✓ No browser distractions</p>
              </div>
            </ModalBody>
            <ModalFooter className="justify-center gap-3">
              <Button
                variant="light"
                onPress={handleDismiss}
                startContent={<Close className="w-4 h-4" />}
              >
                Not Now
              </Button>
              <Button
                color="primary"
                onPress={handleInstall}
                startContent={<Download className="w-4 h-4" />}
                className="font-semibold"
              >
                Install Now
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InstallPrompt;
