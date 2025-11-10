export type Scene = {
    voiceover: string;
    keyword: string[];
    preview_urls?: string[];
    selected_url?: string;
    downloaded_files?: string[];
  };
  
  export type ScriptResponse = {
    title: string;
    total_estimated_time?: string;
    description?: string;
    scenes: Scene[];
    voice_name?: string;
    audio_path?: string;
    audio_url?: string;
    final_video_url?: string;
    final_video_path?: string;
  };
  
  export const API_BASE = "http://127.0.0.1:8000";
  