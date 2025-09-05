export function drawSvgPath(ctx: any, d: string, color = '#000', strokeWidth = 2) {
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = strokeWidth;

  const segs = d.match(/[MLQZmlqz][^MLQZmlqz]*/g) || [];

  let cx = 0, cy = 0;                // current point
  let subStartX = 0, subStartY = 0;  // subpath 시작점
  let hasAnyMove = false;
  let closedByZ = false;

  ctx.beginPath();

  const isRel = (c) => c === c.toLowerCase();

  for (const seg of segs) {
    const cmd = seg[0];
    const nums = seg.slice(1).trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => !isNaN(n));

    if ((cmd === 'M' || cmd === 'm') && nums.length >= 2) {
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = isRel(cmd) ? cx + nums[i]     : nums[i];
        const y = isRel(cmd) ? cy + nums[i + 1] : nums[i + 1];
        if (!hasAnyMove || i === 0) {
          ctx.moveTo(x, y);
          subStartX = x; subStartY = y;
          hasAnyMove = true;
        } else {
          ctx.lineTo(x, y);
        }
        cx = x; cy = y;
      }
    } else if ((cmd === 'L' || cmd === 'l') && nums.length >= 2) {
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = isRel(cmd) ? cx + nums[i]     : nums[i];
        const y = isRel(cmd) ? cy + nums[i + 1] : nums[i + 1];
        ctx.lineTo(x, y);
        cx = x; cy = y;
      }
    } else if ((cmd === 'Q' || cmd === 'q') && nums.length >= 4) {
      for (let i = 0; i + 3 < nums.length; i += 4) {
        const x1 = isRel(cmd) ? cx + nums[i]     : nums[i];
        const y1 = isRel(cmd) ? cy + nums[i + 1] : nums[i + 1];
        const x  = isRel(cmd) ? cx + nums[i + 2] : nums[i + 2];
        const y  = isRel(cmd) ? cy + nums[i + 3] : nums[i + 3];
        ctx.quadraticCurveTo(x1, y1, x, y);
        cx = x; cy = y;
      }
    } else if (cmd === 'Z' || cmd === 'z') {
      ctx.closePath();
      cx = subStartX; cy = subStartY;
      closedByZ = true;
    }
  }
 
  if (hasAnyMove && !closedByZ) {
    ctx.closePath();
  }
 
  ctx.fill('nonzero');  
  ctx.stroke();
}