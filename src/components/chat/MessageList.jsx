import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import Loader from "../common/Loader";

export default function MessageList({ messages, loading, myUid, hasMore, loadingEarlier, onLoadEarlier }) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevScrollHeightRef = useRef(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevCountRef.current && isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages.length, isNearBottom]);

  // When older messages get prepended, content was added above the
  // viewport — without this, the browser keeps scrollTop fixed and the
  // view visually jumps down to whatever's now at that pixel offset.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
    prevScrollHeightRef.current = 0;
  }, [messages]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    setIsNearBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 120);

    if (el.scrollTop < 80 && hasMore && !loadingEarlier) {
      prevScrollHeightRef.current = el.scrollHeight;
      onLoadEarlier?.();
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader label="Loading messages…" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-zinc-400">
        No messages yet — say hi 👋
      </div>
    );
  }

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
      {loadingEarlier && (
        <div className="flex justify-center py-2" role="status" aria-live="polite">
          <Loader2 size={16} className="animate-spin text-zinc-400" />
        </div>
      )}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} isOwn={message.senderId === myUid} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
