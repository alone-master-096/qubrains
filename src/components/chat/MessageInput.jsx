import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSend, onTypingChange }) {
  const [text, setText] = useState("");
  const typingTimeout = useRef(null);

  useEffect(() => () => clearTimeout(typingTimeout.current), []);

  function handleTextChange(e) {
    setText(e.target.value);
    onTypingChange?.(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTypingChange?.(false), 2000);
  }

  function handleSubmitText(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    clearTimeout(typingTimeout.current);
    onTypingChange?.(false);
  }

  return (
    <div className="relative shrink-0 border-t border-zinc-100">
      <form onSubmit={handleSubmitText} className="flex items-center gap-2 px-2 py-3 sm:px-3">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message…"
          aria-label="Message"
          className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
