/**
 * Utilitaires de sanitization pour les routes API
 */

const ALLOWED_CV_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream'
]);

const ALLOWED_DOC_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed'
]);

const MIME_SAFE = /^[a-zA-Z0-9.+\-/]{1,80}$/;

function safeMimeFromDataUrl(dataUrl, allowedSet) {
  if (typeof dataUrl !== 'string') return null;
  if (!dataUrl.startsWith('data:')) return null;
  const comma = dataUrl.indexOf(',');
  if (comma <= 5) return null;
  const meta = dataUrl.substring(5, comma);
  const mimeRaw = (meta.split(';')[0] || '').trim();
  if (!MIME_SAFE.test(mimeRaw)) return null;
  const set = allowedSet || ALLOWED_DOC_MIMES;
  if (!set.has(mimeRaw)) return null;
  return mimeRaw;
}

function escapeFilenameForHeader(input, fallback) {
  let raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) raw = fallback || 'file';
  raw = raw
    .replace(/[\r\n\0]/g, '')
    .replace(/["\\/]/g, '_')
    .slice(0, 200);
  const ascii = raw.replace(/[^\x20-\x7E]/g, '_');
  return { ascii, utf8: encodeURIComponent(raw), full: ascii };
}

function titleEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const normalizedA = (a.normalize ? a.normalize('NFKC') : a).toLowerCase();
  const normalizedB = (b.normalize ? b.normalize('NFKC') : b).toLowerCase();
  return normalizedA === normalizedB;
}

module.exports = {
  ALLOWED_CV_MIMES,
  ALLOWED_DOC_MIMES,
  MIME_SAFE,
  safeMimeFromDataUrl,
  escapeFilenameForHeader,
  titleEquals
};