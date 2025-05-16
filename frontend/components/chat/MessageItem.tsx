// components/chat/MessageItem.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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
    if ("speechSynthesis" in window) {
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
        {message.role === "assistant" ? (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl font-bold mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-semibold mb-2" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside ml-4 mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal list-inside ml-4 mb-2"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-muted-foreground pl-3 italic opacity-80 mb-2"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="underline text-primary hover:opacity-80"
                    target="_blank"
                    rel="noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="prose prose-sm max-w-none">{message.content}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span
            className="text-sm cursor-pointer hover:opacity-70"
            onClick={() => tts(message.content)}
          >
            🔈
          </span>
        </div>
      </div>
    </div>
  );
}
