const paths = {
  volume: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 15v4h16v-4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7M10 11v5M14 11v5"/>',
  logout: '<path d="M10 5H5v14h5M14 8l4 4-4 4m4-4H9"/>'
};
export function icon(name, size = 20) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}
