// Videos share the R2 bucket and the /img/* route with images; the file
// extension is what tells them apart when rendering.
export const VIDEO_EXT = /\.(mp4|m4v|mov|webm)$/i;

export function isVideo(url: string | null | undefined): boolean {
  return !!url && VIDEO_EXT.test(url);
}
