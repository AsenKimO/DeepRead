// components/chat/ChatPanel.tsx
"use client";

import { useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function ChatPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! I'm DeepRead, your AI study assistant. I'll help you understand the document you're reading. Ask me any questions about the content!",
      timestamp: new Date(),
    },
  ]);

  const addMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `This is a simulated response to your question: "${content}". In a real implementation, this would be handled by your AI backend.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full transition-all duration-300 bg-background",
        isCollapsed ? "w-12" : "w-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <h2 className="font-medium">DeepRead</h2>}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex-1 overflow-auto p-4">
            <MessageList messages={messages} />
          </div>
          <div className="p-4 border-t">
            <MessageInput onSendMessage={addMessage} />
          </div>
        </>
      )}
    </div>
  );
}
