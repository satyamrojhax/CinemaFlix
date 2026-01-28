"use client";

import { Close } from "@/utils/icons";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/react";
import { Drawer, DialogProps } from "vaul";
import { forwardRef } from "react";

export type DrawerProps = DialogProps & {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: React.ReactNode;
  backdrop?: "opaque" | "blur" | "transparent";
  fullWidth?: boolean;
  hiddenTitle?: boolean;
  hiddenHandler?: boolean;
  scrollable?: boolean;
  withCloseButton?: boolean;
  classNames?: {
    overlay?: string;
    content?: string;
    title?: string;
    handler?: string;
    contentWrapper?: string;
    scollWrapper?: string;
    childrenWrapper?: string;
  };
};

const VaulDrawer = forwardRef<any, DrawerProps>(({
  children,
  trigger,
  title,
  backdrop = "opaque",
  fullWidth,
  hiddenTitle,
  direction = "bottom",
  hiddenHandler,
  scrollable = true,
  withCloseButton,
  classNames,
  ...props
}, ref) => {
  return (
    <Drawer.Root {...props} direction={direction}>
      {trigger && (
        <Drawer.Trigger asChild>
          {typeof trigger === "string" ? <Button>{trigger}</Button> : trigger}
        </Drawer.Trigger>
      )}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-9998 bg-black/70" />
        <Drawer.Content className="bg-secondary-background text-foreground fixed z-9999 place-self-center outline-hidden right-0 bottom-0 left-0 mt-24 max-h-[97%] w-full rounded-t-2xl md:w-max">
          <div className="relative flex h-full flex-col space-y-5 pt-4 pb-6">
            {withCloseButton && (
              <Button
                isIconOnly
                aria-label="Close"
                radius="full"
                variant="light"
                className="absolute top-3 right-3"
                size="sm"
                onPress={props.onClose}
              >
                <Close size={24} />
              </Button>
            )}
            {!hiddenHandler && (
              <div className="bg-foreground/50 mx-auto h-1.5 w-12 shrink-0 rounded-full" />
            )}
            <Drawer.Title
              aria-hidden={hiddenTitle ? true : undefined}
              className="text-center text-xl"
            >
              {title}
            </Drawer.Title>
            <Drawer.Description aria-hidden className="hidden" />
            <ScrollShadow isEnabled={scrollable}>
              <div className="mx-auto max-w-lg">
                {children}
              </div>
            </ScrollShadow>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
});

VaulDrawer.displayName = 'VaulDrawer';

export default VaulDrawer;
