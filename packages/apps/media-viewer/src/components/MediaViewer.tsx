import { useEffect, useState, useRef } from "react";
import styles from "./MediaViewer.module.css";
import {
  AppsConfig,
  IMAGE_EXTENSIONS,
  useSystemManager,
  useWindowsManager,
  VirtualFile,
  WindowProps,
} from "@prozilla-os/core";

export interface MediaViewerProps extends WindowProps {
  file?: VirtualFile;
}

export const AUDIO_EXTENSIONS: string[] = [
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "aac",
  "flac",
  "wma",
  "aiff",
  "opus",
];

export function MediaViewer({ file, close, setTitle }: MediaViewerProps) {
  const { appsConfig } = useSystemManager();
  const windowsManager = useWindowsManager();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (file != null) setTitle?.(file.id);
  }, [file, setTitle]);

  useEffect(() => {
    console.log("File:", file);
    console.log(AUDIO_EXTENSIONS);

    if (
      file &&
      file.extension &&
      AUDIO_EXTENSIONS.includes(file.extension) &&
      file.source
    ) {
      if (audioRef.current) {
        audioRef.current.src = file.source;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [file]);

  const handlePlay = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (file == null) {
    const fileExplorerApp = appsConfig.getAppByRole(
      AppsConfig.APP_ROLES.FileExplorer
    );

    setTimeout(() => {
      if (fileExplorerApp != null)
        windowsManager?.open(fileExplorerApp.id, { path: "~/Pictures" });
      close?.();
    }, 10);
    return null;
  }

  if (
    file.extension == null ||
    (!IMAGE_EXTENSIONS.includes(file.extension) &&
      !AUDIO_EXTENSIONS.includes(file.extension))
  ) {
    return <p>Invalid file format.</p>;
  }

  if (file.source == null) return <p>File failed to load.</p>;

  if (IMAGE_EXTENSIONS.includes(file.extension)) {
    return (
      <div className={styles.MediaViewer}>
        <img src={file.source} alt={file.id} draggable="false" />
      </div>
    );
  }

  if (AUDIO_EXTENSIONS.includes(file.extension)) {
    return (
      <article className={styles.audioViewer}>
        <h3>Playing audio: {file.id}</h3>
        <audio ref={audioRef} controls />
        <div className={styles.audioControls}>
          <button className={`${isPlaying ? styles.isPlaying : styles.isNotPlaying}`} onClick={handlePlay} disabled={isPlaying}>
            Play
          </button>
          <button className={`${isPlaying ? styles.isPlaying : styles.isNotPlaying}`} onClick={handlePause} disabled={!isPlaying}>
            Pause
          </button>
          <button className={`${isPlaying ? styles.isPlaying : styles.isNotPlaying}`} onClick={handleStop}>Stop</button>
        </div>
      </article>
    );
  }

  return null;
}
