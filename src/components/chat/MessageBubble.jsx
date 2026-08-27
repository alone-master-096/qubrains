import { useRef, useState } from "react";
import { Check, CheckCheck, FileText, FileArchive, Download, Play, Pause } from "lucide-react";
import { formatBytes } from "../../utils/formatBytes";
import { formatDuration } from "../../utils/formatTime";

function formatMessageTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function VoicePlayer({ src, duration }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    setProgress(audio.currentTime / audio.duration);
  }

  return (
    <div className="flex items-center gap-3 px-1 py-1">
      <button
        onClick={toggle}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10"
      >
        {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
        <div className="h-full bg-current opacity-60" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="shrink-0 text-xs opacity-60">{formatDuration(duration)}</span>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />
    </div>
  );
}

function MessageContent({ message }) {
  switch (message.type) {
    case "image":
      return (
        <a href={message.fileUrl} target="_blank" rel="noreferrer">
          <img src={message.fileUrl} alt="" className="max-h-72 w-full rounded-xl object-cover" />
        </a>
      );
    case "video":
      return <video src={message.fileUrl} controls className="max-h-72 w-full rounded-xl" />;
    case "document":
    case "zip":
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noreferrer"
          download={message.fileName}
          className="flex items-center gap-3 rounded-xl bg-black/5 p-3"
        >
          {message.type === "zip" ? <FileArchive size={22} /> : <FileText size={22} />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{message.fileName}</p>
            <p className="text-xs opacity-60">{formatBytes(message.fileSize)}</p>
          </div>
          <Download size={16} className="shrink-0 opacity-60" />
        </a>
      );
    case "voice":
      return <VoicePlayer src={message.fileUrl} duration={message.duration} />;
    default:
      return <p className="whitespace-pre-wrap break-words">{message.text}</p>;
  }
}

export default function MessageBubble({ message, isOwn }) {
  const isEdgeToEdge = message.type === "image" || message.type === "video";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl text-sm ${isEdgeToEdge ? "p-1.5" : "px-4 py-2"} ${
          isOwn ? "rounded-br-sm bg-ink text-paper" : "rounded-bl-sm bg-zinc-100 text-ink"
        }`}
      >
        <MessageContent message={message} />
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${isEdgeToEdge ? "px-2 pb-1" : ""} ${
            isOwn ? "text-paper/60" : "text-zinc-400"
          }`}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {isOwn &&
            (message.seen ? (
              <CheckCheck size={13} className="text-signal" />
            ) : message.delivered ? (
              <CheckCheck size={13} />
            ) : (
              <Check size={13} />
            ))}
        </div>
      </div>
    </div>
  );
}
