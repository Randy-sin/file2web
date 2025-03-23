"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PromptViewerProps {
  systemPrompt: string
  buttonText?: string
  dialogTitle?: string
  className?: string
  onOpen?: () => void
}

const PromptViewer: React.FC<PromptViewerProps> = ({
  systemPrompt,
  buttonText = "查看系统提示词",
  dialogTitle = "系统提示词",
  className,
  onOpen,
}) => {
  // 处理对话框打开事件
  const handleOpenChange = (open: boolean) => {
    if (open && onOpen) {
      onOpen();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:border-blue-800/50 ${className}`}
        >
          <FileText className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <pre className="whitespace-pre-wrap rounded-md bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300 overflow-auto">
            {systemPrompt}
          </pre>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PromptViewer }