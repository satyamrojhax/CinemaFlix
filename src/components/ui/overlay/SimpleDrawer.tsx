"use client";

import { Close } from "@/utils/icons";
import { Button } from "@heroui/button";
import { Drawer, DialogProps } from "vaul";
import { forwardRef } from "react";

export type SimpleDrawerProps = DialogProps & {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: React.ReactNode;
  withCloseButton?: boolean;
};

const SimpleDrawer = forwardRef<any, SimpleDrawerProps>(({
  children,
  trigger,
  title,
  withCloseButton,
  ...props
}, ref) => {
  return (
    <Drawer.Root {...props}>
      {trigger && (
        <Drawer.Trigger asChild>
          {typeof trigger === "string" ? <Button>{trigger}</Button> : trigger}
        </Drawer.Trigger>
      )}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-9998 bg-black/70 backdrop-blur-sm" />
        <Drawer.Content className="bg-background border-l border-divider fixed z-9999 top-0 right-0 bottom-0 h-full w-full max-w-md shadow-2xl data-vaul-no-drag">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <Drawer.Title className="text-xl font-semibold text-foreground">
                {title}
              </Drawer.Title>
              {withCloseButton && (
                <Button
                  isIconOnly
                  aria-label="Close"
                  radius="full"
                  variant="light"
                  size="sm"
                  onPress={props.onClose}
                  className="text-foreground/60 hover:text-foreground"
                >
                  <Close size={20} />
                </Button>
              )}
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4">
                {children}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
});

SimpleDrawer.displayName = 'SimpleDrawer';

export default SimpleDrawer;
