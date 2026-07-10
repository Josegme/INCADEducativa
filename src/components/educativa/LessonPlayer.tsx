"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { saveLessonProgressAction } from "@/app/(dashboard)/cursos/actions/lessonProgressActions";

const SAVE_INTERVAL_MS = 10_000;

interface LessonPlayerProps {
  lessonId: string;
  videoUrl: string;
  tiempoVistoSeg: number;
  completed: boolean;
}

export function LessonPlayer({ lessonId, videoUrl, tiempoVistoSeg, completed }: LessonPlayerProps) {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const lastSaveRef = React.useRef(0);
  const resumedRef = React.useRef(false);

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video || resumedRef.current) return;
    resumedRef.current = true;
    if (tiempoVistoSeg > 0 && tiempoVistoSeg < video.duration) {
      video.currentTime = tiempoVistoSeg;
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    const now = Date.now();
    if (now - lastSaveRef.current < SAVE_INTERVAL_MS) return;
    lastSaveRef.current = now;
    void saveLessonProgressAction(lessonId, video.currentTime, false);
  }

  async function handleEnded() {
    const video = videoRef.current;
    await saveLessonProgressAction(lessonId, video?.duration ?? tiempoVistoSeg, true);
    router.refresh();
  }

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      className="w-full rounded-lg bg-black"
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
      onEnded={completed ? undefined : handleEnded}
    />
  );
}
