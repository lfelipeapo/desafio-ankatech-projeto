"use client";
import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogClose = RadixDialog.Close;

export const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <RadixDialog.Content ref={ref} className={cn("w-full max-w-lg", className)} {...props}>
        {children}
      </RadixDialog.Content>
    </div>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export function DialogCard({ children, className }: { children: React.ReactNode; className?: string }){
  return <div className={cn("relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl", className)}>{children}</div>;
}
export function DialogHeader({ children }: { children: React.ReactNode }){ return <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">{children}</div>; }
export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof RadixDialog.Title>>(({ className, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";
export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof RadixDialog.Description>>(({ className, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={cn("text-xs text-neutral-600 dark:text-neutral-300", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";
export function DialogFooter({ children }: { children: React.ReactNode }){ return <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">{children}</div>; }


