"use client";

import React, { useState, useEffect } from "react";
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

interface ChatPanelProps {
  setChatRef?: React.Dispatch<
    React.SetStateAction<{ addMessageFromText: (text: string) => void } | null>
  >;
  initialContext?: string;
}

export function ChatPanel({ setChatRef, initialContext }: ChatPanelProps) {
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

  useEffect(() => {
    if (initialContext) {
      const initialMessage: Message = {
        id: `initial-${Date.now()}`,
        role: "assistant",
        content: initialContext,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, initialMessage]);
    }
  }, [initialContext]);

  useEffect(() => {
    if (setChatRef) {
      setChatRef({
        addMessageFromText: (text: string) => {
          addMessage(text);
        },
      });
    }
  }, [setChatRef]);

  const addMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const pdfSessionId = "IKIAG";
    const collectionNameForRag = "yo_gurt";

    if (!pdfSessionId || !collectionNameForRag) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Error: PDF not processed yet. Please select or upload a PDF.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/chat_with_pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: content,
          pdf_session_id: pdfSessionId,
          collection_name_for_rag: collectionNameForRag
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // TTS
      

    } catch (error) {
      console.error("Failed to send message to backend:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error communicating with the AI: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    // Simulate assistant response
    // setTimeout(() => {
    //   const assistantMessage: Message = {
    //     id: `assistant-${Date.now()}`,
    //     role: "assistant",
    //     content: `This is a simulated response to your question: "${content}". In a real implementation, this would be handled by your AI backend.`,
    //     timestamp: new Date(),
    //   };

    //   setMessages((prev) => [...prev, assistantMessage]);
    // }, 1000);
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
