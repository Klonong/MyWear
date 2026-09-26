"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

/** Confirmation popup for destructive actions. `trigger` is the element that opens it. */
export function ConfirmDialog({
  trigger,
  children,
  title,
  body,
  confirm,
  onConfirm,
}: {
  trigger: React.ReactElement
  children: React.ReactNode
  title: string
  body: string
  confirm: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="p-6 sm:max-w-md">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="font-heading text-2xl font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 grid grid-cols-2 gap-2 border-0 bg-transparent p-0">
          <AlertDialogCancel variant="outline" className="h-12 border-foreground">
            Keep it
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="h-12 font-heading text-base font-semibold">
            {confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
