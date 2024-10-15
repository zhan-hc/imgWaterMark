interface IntervalMap {
  hor: number, // 水平间隔
  ver: number // 垂直间隔
}
// 默认（水印文字倾斜全图排列）水印绘制函数
export const defaultMaskDraw = (canvas: HTMLCanvasElement, text: string, { hor: horInterval, ver: verInterval }: IntervalMap, { radian }: any) => {
  const { width, height } = canvas
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.rotate(radian)
  const sinValue = Math.sin(Math.abs(radian));
  // 旋转之后多余的宽度
  const rotatedX = sinValue * height
  const rotatedY = sinValue * width
  const textWidth = ctx.measureText(text).width;
  for (let x = - rotatedX; x < (width + rotatedX); x += +horInterval + textWidth ) {
    for (let y = -rotatedY; y < (height + rotatedY); y += +verInterval ) {
      ctx.fillText(text, x, y);
    }
  }
}

// 普通（右下角一个水印）水印绘制函数
export const normalMaskDraw = (canvas: HTMLCanvasElement, text: string, { hor: horInterval, ver: verInterval }: IntervalMap) => {
  const { width, height } = canvas
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, width - textWidth - horInterval, height - verInterval);
}