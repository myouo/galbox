/* Generated from schema/project.json. */

export interface ProjectConfig {
  version: 1;
  source: string;
  port: string;
  program: string;
  assetsRoot: string;
  /**
   * @maxItems 256
   */
  assets: {
    id: string;
    kind: "image" | "audio" | "font";
    path: string;
    mime: "image/svg+xml" | "image/png" | "audio/wav" | "font/ttf" | "audio/mpeg" | "audio/ogg";
    playback?: "buffer" | "element";
  }[];
  series?: string;
  resourcePolicy?: string;
}
