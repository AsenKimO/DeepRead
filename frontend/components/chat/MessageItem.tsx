// components/chat/MessageItem.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isAssistant = message.role === "assistant";

  const tts = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8">
        {isAssistant ? (
          <>
            <AvatarFallback>DR</AvatarFallback>
            <AvatarImage src="/ai-avatar.png" />
          </>
        ) : (
          <AvatarFallback>You</AvatarFallback>
        )}
      </Avatar>

      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isAssistant
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <p>{message.content}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
            <span className="text-sm cursor-pointer hover:opacity-70" onClick={() => tts(message.content)}>
            🔈
            </span>
        </div>
      </div>
    </div>
  );
}
