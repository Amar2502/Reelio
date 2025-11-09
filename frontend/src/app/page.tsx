"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Loader2,
  Play,
  Download,
  Image as ImageIcon,
  Mic,
  Film,
  CheckCircle,
} from "lucide-react";

/**
 * app/page.tsx
 *
 * Next.js 14 App Router - Client Component
 * TailwindCSS required.
 *
 * Flow implemented:
 * 1. POST /generate_script        -> get initial script (scenes with empty preview_urls & selected_url)
 * 2. POST /get_urls               -> populate preview_urls (4 per scene)
 * 3. User selects 1 preview per scene (scene.selected_url)
 * 4. POST /download_selected_visuals -> downloads selected clips on server (updates downloaded_files)
 * 5. User picks voice from list -> POST /generate_audio
 * 6. Audio preview shown (response.audio_path)
 * 7. POST /generate_video        -> generate final video
 * 8. Final video shown (response.final_video_path)
 *
 * NOTE:
 * - Backend URLs are hard-coded to http://127.0.0.1:8000 (change if different)
 * - The frontend assumes backend returns the JSON structures described in the conversation.
 * - Add CORS on backend and run both servers.
 */

/* ----------------------------- Types ----------------------------- */

type Scene = {
  voiceover: string;
  keyword: string[]; // keywords from script generator
  preview_urls?: string[]; // filled by get_urls
  selected_url?: string; // chosen by user
  downloaded_files?: string[]; // filled after download_selected_visuals
};

type ScriptResponse = {
  title: string;
  total_estimated_time?: string;
  description?: string;
  scenes: Scene[];
  voice_name?: string;
  audio_path?: string;
  final_video_path?: string;
};

/* -------------------------- Helper consts ------------------------- */

const API_BASE = "http://127.0.0.1:8000";
const VOICES = ["tara", "leah", "jess", "leo", "dan", "mia", "zac", "zoe"];

/* --------------------------- Component ---------------------------- */

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState<ScriptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    | "idle"
    | "script_generated"
    | "fetching_previews"
    | "selecting_previews"
    | "downloading_selected"
    | "select_voice"
    | "generating_audio"
    | "audio_ready"
    | "generating_video"
    | "video_ready"
  >("idle");
  const [error, setError] = useState<string | "">("");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  /* ------------------------ Step 1: Generate Script ------------------------ */
  const handleGenerateScript = async () => {
    setError("");
    if (!prompt.trim()) {
      setError("Please enter a topic or prompt.");
      return;
    }
    setLoading(true);
    setStep("idle");
    try {
      const res = await fetch(`${API_BASE}/generate_script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: ScriptResponse = await res.json();
      // Ensure scenes array exists and has placeholders
      data.scenes = data.scenes || [];
      data.scenes = data.scenes.map((s) => ({
        ...s,
        preview_urls: s.preview_urls || [],
        selected_url: s.selected_url || "",
        downloaded_files: s.downloaded_files || [],
      }));
      setScript(data);
      setStep("script_generated");
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate script. Check backend or network.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------- Step 2: Get preview URLs for every scene ------------------- */
  const handleFetchPreviews = async () => {
    if (!script) return;
    setError("");
    setLoading(true);
    setStep("fetching_previews");
    try {
      // We'll send keywords for each scene to backend so it can return 4 preview URLs per scene
      const payload = {
        title: script.title,
        scenes: script.scenes.map((s) => ({ keyword: s.keyword })),
      };
      const res = await fetch(`${API_BASE}/get_urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      // Expecting data.scenes to contain preview_urls arrays aligned to original scenes
      const updatedScenes = script.scenes.map((sc, idx) => {
        const incoming = data.scenes?.[idx] || {};
        return {
          ...sc,
          preview_urls: incoming.preview_urls || incoming.preview_urls || [],
        };
      });

      setScript({ ...script, scenes: updatedScenes });
      setStep("selecting_previews");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch preview URLs.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ User selects one preview per scene ------------------ */
  const handleSelectPreview = (sceneIdx: number, url: string) => {
    if (!script) return;
    const scenes = script.scenes.map((s, idx) =>
      idx === sceneIdx ? { ...s, selected_url: url } : s
    );
    setScript({ ...script, scenes });
  };

  /* ---------------- Step 3: Send selected URLs to be downloaded on server ---------------- */
  const handleDownloadSelected = async () => {
    if (!script) return;
    const notSelected = script.scenes.some((s) => !s.selected_url);
    if (notSelected) {
      setError("Please select one preview for each scene before continuing.");
      return;
    }
    setError("");
    setLoading(true);
    setStep("downloading_selected");
    try {
      const payload = {
        title: script.title,
        selected_urls: script.scenes.map((s) => s.selected_url),
      };
      const res = await fetch(`${API_BASE}/download_selected_visuals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      // Expect backend to return updated downloaded_files per scene
      const updatedScenes = script.scenes.map((sc, idx) => ({
        ...sc,
        downloaded_files: data.scenes?.[idx]?.downloaded_files || sc.downloaded_files,
      }));
      setScript({ ...script, scenes: updatedScenes });
      setStep("select_voice");
    } catch (err) {
      console.error(err);
      setError("Failed to download selected visuals.");
      setStep("selecting_previews");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Step 4: Generate audio with selected voice ---------------- */
  const handleGenerateAudio = async (voice: string) => {
    if (!script) return;
    setSelectedVoice(voice);
    setError("");
    setLoading(true);
    setStep("generating_audio");
    try {
      const payload = {
        title: script.title,
        voice_name: voice,
        // Optionally send text or scenes if backend needs it
        scenes: script.scenes.map((s) => ({ voiceover: s.voiceover })),
      };
      const res = await fetch(`${API_BASE}/generate_audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      // Expect data.audio_path and perhaps voice_name updated
      const updated = { ...script, audio_path: data.audio_path, voice_name: voice };
      setScript(updated);
      setStep("audio_ready");
    } catch (err) {
      console.error(err);
      setError("Failed to generate audio.");
      setStep("select_voice");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Step 5: Generate final video ---------------- */
  const handleGenerateVideo = async () => {
    if (!script) return;
    setError("");
    setLoading(true);
    setStep("generating_video");
    try {
      const payload = {
        title: script.title,
        // send whatever backend requires; we'll send scenes, audio path & voice
        scenes: script.scenes.map((s) => ({
          selected_url: s.selected_url,
          downloaded_files: s.downloaded_files,
        })),
        audio_path: script.audio_path,
        voice_name: script.voice_name,
      };
      const res = await fetch(`${API_BASE}/generate_video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      // Expect final_video_path returned
      const updated = { ...script, final_video_path: data.final_video_path || data.final_path || data.final_video };
      setScript(updated);
      setStep("video_ready");
    } catch (err) {
      console.error(err);
      setError("Failed to generate final video.");
      setStep("audio_ready");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- Small UI helpers --------------------------- */

  const allPreviewsSelected = () =>
    !!script && script.scenes.every((s) => s.selected_url && s.selected_url.length > 0);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
              🎬 Reelio — AI Storyteller
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Create short educational videos from a prompt. Follow the steps left-to-right.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="text-xs text-slate-400 px-3 py-1 rounded-md bg-slate-800/60 border border-slate-700"
              title={`Current step: ${step}`}
            >
              Step: {step}
            </div>
            <div className="text-xs text-slate-400 px-3 py-1 rounded-md bg-slate-800/60 border border-slate-700">
              Backend: {API_BASE}
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-900/60 border border-red-700 p-3 text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Prompt */}
        <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a topic (e.g., The Wonders of the Solar System)"
              className="flex-1 min-h-[88px] p-3 rounded-md bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="w-full sm:w-56 flex flex-col gap-2">
              <button
                onClick={handleGenerateScript}
                disabled={loading}
                className="py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && step === "idle" ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate Script</span>
                )}
              </button>

              <button
                onClick={handleFetchPreviews}
                disabled={!script || loading}
                className="py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-60 flex items-center justify-center gap-2"
                title="Fetch 4 preview URLs for each scene using /get_urls"
              >
                {loading && step === "fetching_previews" ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Fetching Previews</span>
                  </>
                ) : (
                  <span>Get Preview URLs</span>
                )}
              </button>
            </div>
          </div>

          {/* Show generated script summary */}
          {script && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 rounded-md bg-slate-900/40 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{script.title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{script.description}</p>
                </div>
                <div className="text-sm text-slate-400">
                  Est. {script.total_estimated_time || "60"}s
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {script.scenes.map((s, i) => (
                  <div key={i} className="rounded-md p-3 bg-slate-800/40 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-700 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Scene {i + 1}</div>
                          <div className="text-xs text-slate-400">{s.keyword?.join(", ")}</div>
                        </div>
                      </div>

                      <div className="text-slate-300 text-sm">Voiceover preview</div>
                    </div>

                    <p className="mt-3 text-slate-200 text-sm">{s.voiceover}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* Step 2: Preview selection */}
        {script && (
          <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select preview clips (1 per scene)</h3>
              <div className="text-sm text-slate-400">
                {script.scenes.length} scenes • {script.scenes.filter((s) => s.selected_url).length} selected
              </div>
            </div>

            <div className="mt-4 space-y-6">
              {script.scenes.map((scene, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-700 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Scene {idx + 1}</div>
                      <div className="text-sm text-slate-400">{scene.keyword?.join(", ")}</div>
                    </div>
                    <div className="text-sm text-slate-400">Voice: {scene.voiceover?.slice(0, 40)}…</div>
                  </div>

                  {/* Previews grid */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {scene.preview_urls && scene.preview_urls.length > 0 ? (
                      scene.preview_urls.map((url, uidx) => {
                        const isSelected = scene.selected_url === url;
                        return (
                          <div
                            key={uidx}
                            className={`relative rounded-md overflow-hidden border ${
                              isSelected ? "border-emerald-400 ring-2 ring-emerald-400" : "border-slate-700"
                            }`}
                          >
                            {/* use video preview if mp4 else image */}
                            {url.endsWith(".mp4") || url.includes(".mp4") ? (
                              <video
                                src={url}
                                controls={false}
                                className="w-full h-36 object-cover bg-black"
                                onClick={() => handleSelectPreview(idx, url)}
                                title="Click to select this preview"
                              />
                            ) : (
                              // fallback to image
                              <div
                                onClick={() => handleSelectPreview(idx, url)}
                                className="w-full h-36 flex items-center justify-center bg-black/20 cursor-pointer"
                              >
                                <ImageIcon className="w-8 h-8 text-slate-400" />
                              </div>
                            )}

                            <div className="p-2 flex items-center justify-between bg-slate-900/60">
                              <div className="text-xs text-slate-300 truncate">{`Preview ${uidx + 1}`}</div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSelectPreview(idx, url)}
                                  className="text-xs px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
                                >
                                  {isSelected ? "Selected" : "Select"}
                                </button>
                                <button
                                  onClick={() => window.open(url, "_blank")}
                                  className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
                                  title="Open preview in new tab"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-400 col-span-4">No previews fetched yet for this scene.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDownloadSelected}
                disabled={!script || loading || !allPreviewsSelected()}
                className="py-2 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2"
              >
                {loading && step === "downloading_selected" ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Downloading Selected</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Download Selected</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFetchPreviews}
                disabled={loading}
                className="py-2 px-4 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-60"
              >
                Refresh Previews
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Voice selection and audio generation */}
        {script && (step === "select_voice" || step === "generating_audio" || step === "audio_ready") && (
          <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Choose a voice & generate audio</h3>
              <div className="text-sm text-slate-400">Selected voice: {selectedVoice || "none"}</div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {VOICES.map((v) => {
                const selected = selectedVoice === v;
                return (
                  <button
                    key={v}
                    onClick={() => handleGenerateAudio(v)}
                    disabled={loading}
                    className={`py-3 px-3 rounded-md border ${
                      selected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-700"
                    } hover:bg-slate-700 flex items-center justify-between`}
                  >
                    <div className="text-sm font-medium">{v}</div>
                    {loading && step === "generating_audio" && selected && <Loader2 className="animate-spin" />}
                  </button>
                );
              })}
            </div>

            {/* Audio player */}
            {script.audio_path && (
              <div className="mt-4 p-3 rounded-md bg-slate-900/40 border border-slate-700 flex items-center gap-4">
                <Mic className="w-6 h-6 text-slate-200" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Voiceover</div>
                  <div className="text-xs text-slate-400">{script.voice_name || selectedVoice}</div>
                </div>
                <audio controls src={script.audio_path} className="max-w-md" />
                <a
                  href={script.audio_path}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 py-1 px-3 rounded bg-pink-600 hover:bg-pink-700"
                >
                  <Download className="w-4 h-4 inline" />
                </a>
              </div>
            )}
          </section>
        )}

        {/* Step 4: Generate final video */}
        {script && (step === "audio_ready" || step === "generating_video" || step === "video_ready") && (
          <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Finalize & Generate Video</h3>
              <div className="text-sm text-slate-400">Audio ready: {!!script.audio_path ? "yes" : "no"}</div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleGenerateVideo}
                disabled={!script.audio_path || loading}
                className="py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
              >
                {loading && step === "generating_video" ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Generating Video</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Generate Final Video</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  // quick preview: open audio or the first downloaded file
                  if (script.final_video_path) window.open(script.final_video_path, "_blank");
                  else if (script.scenes?.[0]?.downloaded_files?.[0])
                    window.open(script.scenes[0].downloaded_files[0], "_blank");
                  else if (script.audio_path) window.open(script.audio_path, "_blank");
                }}
                className="py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-600"
              >
                Quick Preview
              </button>
            </div>

            {script.final_video_path && (
              <div className="mt-6 rounded-md overflow-hidden border border-slate-700">
                <div className="p-3 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-slate-200" />
                    <div>
                      <div className="font-medium">Final Video</div>
                      <div className="text-xs text-slate-400">{script.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={script.final_video_path}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <video controls src={script.final_video_path} className="w-full h-[420px] object-contain bg-black" />
              </div>
            )}
          </section>
        )}

        <footer className="text-xs text-slate-500 text-center py-6">
          Tip: Make sure your backend is running and CORS is enabled. This UI expects the endpoints to follow the
          described payloads/responses.
        </footer>
      </div>
    </main>
  );
}
