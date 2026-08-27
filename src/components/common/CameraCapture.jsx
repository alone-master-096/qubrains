import { useEffect, useRef, useState } from "react";
import { X, RotateCcw, Circle } from "lucide-react";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setError("");
      stopStream();

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera isn't supported in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError("Camera access was denied. Allow camera access in your browser settings to take a photo.");
      }
    }

    if (!capturedUrl) start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, capturedUrl]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        setCapturedUrl(URL.createObjectURL(blob));
        stopStream();
      },
      "image/jpeg",
      0.9
    );
  }

  function handleRetake() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
  }

  function handleClose() {
    stopStream();
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-ink">
      <div className="flex items-center justify-between p-4">
        <button onClick={handleClose} aria-label="Close camera" className="rounded-full p-2 text-paper/80 hover:bg-paper/10">
          <X size={22} />
        </button>
        {!capturedUrl && !error && (
          <button
            onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
            aria-label="Flip camera"
            className="rounded-full p-2 text-paper/80 hover:bg-paper/10"
          >
            <RotateCcw size={20} />
          </button>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <p className="px-8 text-center text-sm text-paper/70">{error}</p>
        ) : capturedUrl ? (
          <img src={capturedUrl} alt="Captured preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="max-h-full max-w-full object-contain" />
        )}
      </div>

      <div className="flex items-center justify-center gap-6 p-6">
        {capturedUrl ? (
          <>
            <button
              onClick={handleRetake}
              className="rounded-full border border-paper/30 px-5 py-2.5 text-sm font-medium text-paper"
            >
              Retake
            </button>
            <button
              onClick={() => capturedBlob && onCapture(capturedBlob)}
              className="rounded-full bg-signal px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-signal-dark"
            >
              Use photo
            </button>
          </>
        ) : (
          !error && (
            <button
              onClick={handleCapture}
              aria-label="Take photo"
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-paper/80"
            >
              <Circle size={48} className="fill-paper text-paper" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
