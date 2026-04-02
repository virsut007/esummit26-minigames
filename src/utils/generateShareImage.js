import html2canvas from 'html2canvas'

/**
 * generateShareImage — captures a DOM element as a Blob (PNG).
 *
 * @param {React.RefObject} elementRef - ref pointing to the ScoreShareCard root div
 * @returns {Promise<Blob>}
 *
 * Callers should await document.fonts.ready before calling if they suspect
 * the custom font hasn't loaded yet (we do it here for safety).
 */
export async function generateShareImage(elementRef) {
  if (!elementRef?.current) throw new Error('generateShareImage: no element ref')

  // Ensure "Press Start 2P" (and any other fonts) are fully loaded
  await document.fonts.ready

  const el = elementRef.current

  const canvas = await html2canvas(el, {
    scale: 2,              // 2× for retina — yields ~900 × 1600 px output
    useCORS: true,
    allowTaint: false,
    backgroundColor: null, // preserve transparency if any
    logging: false,
    width:  el.offsetWidth,
    height: el.offsetHeight,
    // Scroll offsets: force (0,0) so the capture isn't shifted even when
    // the element is rendered off-screen via position:fixed + top:-9999px
    scrollX: 0,
    scrollY: 0,
    windowWidth:  el.offsetWidth,
    windowHeight: el.offsetHeight,
    x: 0,
    y: 0,
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
      'image/png',
      1.0,
    )
  })
}
