// Shared admin uploader. Images go through /api/upload in one request;
// videos are chunked through /api/upload-video (R2 multipart) so files
// larger than a Worker request can carry still make it up.
(function () {
  const CHUNK = 10 * 1024 * 1024;
  const VIDEO_EXT = /\.(mp4|m4v|mov|webm)$/i;

  window.isVideoUrl = (url) => VIDEO_EXT.test(url || '');

  // Small HTML snippet for a thumbnail of either kind.
  window.mediaThumb = (url) =>
    window.isVideoUrl(url)
      ? `<video src="${url}#t=0.1" muted playsinline preload="metadata"></video><span class="vid-badge">▶</span>`
      : `<img src="${url}" alt="" loading="lazy" />`;

  async function json(res) {
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.error) throw new Error(out.error || `Upload failed (${res.status}).`);
    return out;
  }

  async function uploadImage(file, slug) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slug', slug);
    return (await json(await fetch('/api/upload', { method: 'POST', body: fd }))).url;
  }

  async function uploadVideo(file, slug, onProgress) {
    const type = file.type || (/\.mov$/i.test(file.name) ? 'video/quicktime' : 'video/mp4');
    const { key, uploadId } = await json(await fetch('/api/upload-video?action=create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: file.name, type, size: file.size, slug }),
    }));
    const q = `key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}`;
    const parts = [];
    try {
      const total = Math.ceil(file.size / CHUNK);
      for (let i = 0; i < total; i++) {
        const chunk = file.slice(i * CHUNK, (i + 1) * CHUNK);
        let part;
        for (let attempt = 0; ; attempt++) {
          try {
            part = await json(await fetch(`/api/upload-video?action=part&${q}&part=${i + 1}`, {
              method: 'PUT',
              headers: { 'content-type': 'application/octet-stream' },
              body: chunk,
            }));
            break;
          } catch (err) {
            if (attempt >= 2) throw err;
          }
        }
        parts.push(part);
        onProgress && onProgress((i + 1) / total);
      }
      return (await json(await fetch(`/api/upload-video?action=complete&${q}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ parts }),
      }))).url;
    } catch (err) {
      fetch(`/api/upload-video?action=abort&${q}`, { method: 'POST' }).catch(() => {});
      throw err;
    }
  }

  // Resolves to the /img/* URL, or throws with a readable message.
  window.uploadMedia = (file, slug, onProgress) => {
    if (file.type.startsWith('video/') || VIDEO_EXT.test(file.name)) return uploadVideo(file, slug, onProgress);
    if (file.type.startsWith('image/')) return uploadImage(file, slug);
    return Promise.reject(new Error(`${file.name}: only images and videos can be uploaded.`));
  };
})();
