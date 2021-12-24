/**
 * CGL.saveAs
 * ==============
 *
 * Collection of utilities to export and save canvas as image or vide
 * The dependencies must also be included when including this to another CodePen!
 * Inspired with https://stackoverflow.com/questions/50681683/how-to-save-canvas-animation-as-gif-or-webm?noredirect=1&lq=1
 *
 */

window.CGL = window.CGL || {};

window.CGL.saveAs = (function () {
  /**
   * @method PNG
   * @param {canvas} canvas reference (not ctx)
   * @param {filename} desired file name without extension
   */
  const PNG = function (canvas, filename) {
    canvas.toBlob(function (blob) {
      saveAs(blob, `${filename}.png`);
    });
  };

  /**
   * @method WEBM
   * @param {canvas} canvas reference (not ctx)
   * @param {filename} desired file name without extension
   */
  const WEBM = function (canvas, filename) {
    const chunks = [];
    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = (e) =>
      saveAs(new Blob(chunks, { type: 'video/webm' }), `${filename}.webm`);

    return {
      start: () => recorder.start(),
      stop: () => recorder.stop(),
    };
  };

  return {
    PNG,
    WEBM,
  };
})();

window.CGL.colorConvert = (function () {
  const canvas = document.createElement('canvas');
  canvas.height = 1;
  canvas.width = 1;
  const ctx = canvas.getContext('2d');

  /**
   * @method colorConvert
   * @param {color1} first color (in any format)
   * @param {color2} second color (in any format)
   * @param {weight} opacity of the second color during the mixing [0,1]
   * @param {compositeOperation} any mixing mode that can be used in canvas globalCompositeOperation
   * @return {string} rgba color
   */
  const mixBlendColors = function (color1, color2, weight, compositeOperation) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 1, 1);

    ctx.globalAlpha = weight;
    ctx.globalCompositeOperation = compositeOperation || 'source-over';
    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, 1, 1);

    let [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    a = a / 255;

    return `rgba(${r},${g},${b},${a})`;
  };

  /**
   * @method opacity
   * @param {color} entry color (in any format)
   * @param {opacity} opacity of the entry color
   * @return {string} rgba color
   */
  const opacity = function (color, opacity) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';

    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);

    let [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    a = a / 255;

    return `rgba(${r},${g},${b},${a})`;
  };

  return {
    mixBlendColors,
    opacity,
  };
})();
