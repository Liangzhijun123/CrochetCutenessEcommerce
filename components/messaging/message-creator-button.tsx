"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageCircle } from "lucide-react"
import { MessagingInterface } from "./messaging-interface"
import { useAuth } from "@/context/auth-context"

interface MessageCreatorButtonProps {
  patternId: string
  creatorId: string
  creatorName: string
  patternName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function MessageCreatorButton({
  patternId,
  creatorId,
  creatorName,
  patternName,
  variant = "outline",
  size = "default",
  className
}: MessageCreatorButtonProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show button if user is the creator
  if (!user || user.id === creatorId) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Message Creator
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Message {creatorName} about {patternName}
          </DialogTitle>
        </DialogHeader>
        
        <MessagingInterface
          patternId={patternId}
          creatorId={creatorId}
          className="border-0"
        />
      </DialogContent>
    </Dialog>
  )
}