"use client";

import { useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

function formatSeconds(value) {
  if (!Number.isFinite(value)) return "0:00";
  const total = Math.max(0, Math.floor(value));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export default function Home() {
  const mediaRef = useRef(null);
  const ffmpegRef = useRef(null);
  const [file, setFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isVideo, setIsVideo] = useState(true);

  const [loadingEngine, setLoadingEngine] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("Файл оруулж тайрах хэсгээ сонгоно уу.");

  const [outputUrl, setOutputUrl] = useState("");
  const [outputName, setOutputName] = useState("");

  const hasSelection = useMemo(() => endTime > startTime, [startTime, endTime]);

  async function loadEngine() {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }

    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return;

    setLoadingEngine(true);
    setStatus("Engine ачаалж байна...");

    const base = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
    });

    setLoadingEngine(false);
    setStatus("Engine бэлэн боллоо.");
  }

  function onFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);

    const nextUrl = URL.createObjectURL(selected);
    const type = selected.type;

    setFile(selected);
    setMediaUrl(nextUrl);
    setOutputUrl("");
    setOutputName("");
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setIsVideo(type.startsWith("video/"));
    setStatus("Файл уншиж байна...");
  }

  function onLoadedMetadata() {
    const len = mediaRef.current?.duration || 0;
    setDuration(len);
    setStartTime(0);
    setEndTime(len);
    setStatus("Тайрах эхлэх/дуусах хугацаагаа тохируулна уу.");
  }

  async function handleTrim() {
    if (!file) return;
    if (!hasSelection) {
      setStatus("Дуусах хугацаа эхлэх хугацаанаас их байх ёстой.");
      return;
    }

    try {
      await loadEngine();
      const ffmpeg = ffmpegRef.current;

      setProcessing(true);
      setStatus("Тайралт хийгдэж байна...");

      const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "mp3");
      const inputName = `input.${ext}`;
      const outputExt = isVideo ? "mp4" : "mp3";
      const trimmedName = `trimmed.${outputExt}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args = [
        "-ss",
        String(startTime),
        "-to",
        String(endTime),
        "-i",
        inputName,
      ];

      if (isVideo) {
        args.push("-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart");
      } else {
        args.push("-vn", "-c:a", "libmp3lame");
      }

      args.push(trimmedName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(trimmedName);
      const mime = isVideo ? "video/mp4" : "audio/mpeg";
      const blob = new Blob([data.buffer], { type: mime });

      if (outputUrl) URL.revokeObjectURL(outputUrl);

      const nextOutUrl = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.[^/.]+$/, "") || "media";
      setOutputUrl(nextOutUrl);
      setOutputName(`${baseName}-cut.${outputExt}`);
      setStatus("Амжилттай тайрлаа. Одоо татаж авна уу.");
    } catch (error) {
      console.error(error);
      setStatus("Алдаа гарлаа. Өөр форматтай файл туршаад үзнэ үү.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="studio-page">
      <section className="studio-hero">
        <p className="eyebrow">MEDIA CUTTER STUDIO</p>
        <h1>Audio болон Video тайрах шинэ project</h1>
        <p className="hero-sub">
          Файлаа оруулаад хугацаагаа сонгоно. Тайрсан хувилбарыг шууд татаж авна.
        </p>
      </section>

      <section className="studio-card">
        <label className="upload-zone">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={onFileChange}
            className="hidden-input"
          />
          <span>Файл сонгох (audio/video)</span>
        </label>

        {mediaUrl ? (
          <div className="preview-wrap">
            {isVideo ? (
              <video
                ref={mediaRef}
                controls
                src={mediaUrl}
                onLoadedMetadata={onLoadedMetadata}
                className="media-preview"
              />
            ) : (
              <audio
                ref={mediaRef}
                controls
                src={mediaUrl}
                onLoadedMetadata={onLoadedMetadata}
                className="audio-preview"
              />
            )}
          </div>
        ) : null}

        {duration > 0 ? (
          <div className="controls">
            <div className="range-group">
              <label>Эхлэх: {formatSeconds(startTime)}</label>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={startTime}
                onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 0.1))}
              />
            </div>

            <div className="range-group">
              <label>Дуусах: {formatSeconds(endTime)}</label>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={endTime}
                onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 0.1))}
              />
            </div>

            <p className="selection-info">
              Тайрах урт: {formatSeconds(endTime - startTime)} / Нийт: {formatSeconds(duration)}
            </p>

            <button
              type="button"
              onClick={handleTrim}
              className="trim-btn"
              disabled={processing || loadingEngine || !hasSelection}
            >
              {processing ? "Тайрч байна..." : loadingEngine ? "Engine ачаалж байна..." : "Cut хийх"}
            </button>
          </div>
        ) : null}

        <p className="status-text">{status}</p>

        {outputUrl ? (
          <div className="output-box">
            <a href={outputUrl} download={outputName} className="download-link">
              Тайрсан файлыг татах
            </a>
          </div>
        ) : null}
      </section>
    </main>
  );
}
