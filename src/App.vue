<template>
  <header>
    <a class="icon" href="https://github.com/zhan-hc/imgWaterMark" target="_blank">
      <Github></Github>
    </a>
  </header>
  <h2 style="margin-top: 64px;">图片添加水印</h2>
  <div class="box">
    <div>
      <label for="name">水印名称：</label>
      <input v-model="text" type="text" placeholder="水印名称" @change="drawImg"/>
    </div>
    <div>
      <label for="color">水印颜色：</label>
      <input v-model="color" type="color" placeholder="水印颜色" @change="colorChange"/>
    </div>
    <div>
      <label for="fontsize">水印字体大小：</label>
      <input v-model="fontSize" type="text" placeholder="水印字体大小" pattern="[0-9]*" @change="colorChange"/>
    </div>
    <div>
      <label for="opacity">透明度：</label>
      <input v-model="opacity" type="text" style="width: 50px" @change="drawImg"/>
      &nbsp;<span>(0.1 -> 1)</span>
    </div>
    <div v-if="markStyle === 'default'">
      <label for="radian">旋转角度：</label>
      <input v-model="radian" type="text" placeholder="旋转角度：" @change="drawImg"/>
    </div>
    <div>
      <label for="interval">水平间隔：</label>
      <input v-model="horInterval" type="text" placeholder="水平间隔：" @change="drawImg"/>
    </div>
    <div>
      <label for="interval">垂直间隔：</label>
      <input v-model="verInterval" type="text" placeholder="垂直间隔：" @change="drawImg"/>
    </div>
    <div>
      水印样式：
      <input v-model="markStyle" type="radio" value="default" @change="radioChange">
      <label>倾斜全图排列水印</label>
      <input v-model="markStyle" type="radio" value="normal" @change="radioChange">
      <label>右下角标记水印</label>
    </div>
    <input type="file" @change="handleFileUpload" accept="image/*"/>
    <button @click="downloadImg">导出水印图片</button>
    <div>
      <label for="interval">图片压缩质量：</label>
      <input v-model="zipNum" type="text" placeholder="导出图片压缩质量"/>
    </div>
    <canvas class="canvas" ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import hexRgb from 'hex-rgb';
import 'blueimp-canvas-to-blob';
import { computed, reactive, ref, toRefs } from "vue";
import { defaultMaskDraw, normalMaskDraw } from './utils/draw'
import { Github } from '@janus-c/icons-vue'

interface IntervalMap {
  hor: number, // 水平间隔
  ver: number // 垂直间隔
}

interface MarkStyleMap {
  [key: string]: (canvas: HTMLCanvasElement, text: string, interval: IntervalMap, extra?: any) => void;
}

const canvas = ref<HTMLCanvasElement | null>(null)
const maskImg = ref<HTMLImageElement | null>(null)

const state = reactive({
  markStyle: 'default',
  text: '水印文字',
  color: '#ffffff',
  opacity: 0.5,
  imgUrl: '',
  radian: -30,
  rgbaColor: { red: 255, green: 255, blue: 255, alpha: 1 },
  zipNum: 0.8,
  horInterval: 50,
  verInterval: 50,
  fontSize: 20
})

const { markStyle, text, color, opacity, imgUrl, rgbaColor, zipNum, horInterval, verInterval, radian, fontSize  } = toRefs(state)

const interval = computed(() => {
  return {
    hor: horInterval.value,
    ver: verInterval.value
  }
})

const radianVal = computed(() => {
  return (radian.value / 180) * Math.PI
})

const textColor = computed(() => {
  return `rgba(${rgbaColor.value.red},${rgbaColor.value.blue},${rgbaColor.value.green},${opacity.value})`
})
const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: Event) => {
        if (!e.target) return;
        imgUrl.value = (e.target as any).result
        drawImg()
      };
    reader.readAsDataURL(file);
  }
}

const colorChange = () => {
  rgbaColor.value = hexRgb(color.value.replace('#', ''))
  drawImg()
}

const radioChange = () => {
  // interval.value = markStyle.value === 'default' ? '80' : '10';
  drawImg()
}

const initCanvas = () => {
  if (canvas.value && maskImg.value) {
    canvas.value.width = maskImg.value.width;
    canvas.value.height = maskImg.value.height;
    drawMark();
  } else {
    alert('请先选择图片')
  }
}
const drawImg = () => {
  if (!imgUrl.value) return
  const img = new Image();
  img.onload = () => {
    maskImg.value = img;
    initCanvas()
  };
  img.src = imgUrl.value
}

// 水印样式变换
const markStyleChange = () => {
  const markStyleMap:MarkStyleMap = {
    default: defaultMaskDraw,
    normal: normalMaskDraw
  }
  markStyleMap[markStyle.value]!(canvas.value!, text.value!, interval.value!, { radian: radianVal.value })
}

// 水印复制
function drawMark () {
  if (canvas.value && maskImg.value) {
    const ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D;
    const { width, height } = canvas.value as HTMLCanvasElement
    // 通过重新设置宽高来达到重置画布的功能
    canvas.value.width = width;
    canvas.value.height = height;
    ctx.drawImage(maskImg.value, 0, 0, width, height);
    ctx.font = `${state.fontSize}px Arial`;
    ctx.textBaseline="bottom"; 
    ctx.fillStyle = textColor.value;
    markStyleChange()
  } else {
    alert('请先选择图片')
  }
}
/**
 * 下载图片
*/
const downloadImg = () => {
  if (canvas.value && maskImg.value) {
  /** 默认导出
    const link = document.createElement('a');
    link.href = canvas.value.toDataURL('image/png');
    link.download = 'mark.png';
    link.click();
  */
  // 压缩导出
    canvas.value?.toBlob((blob) => {
      // 处理生成的 Blob 对象
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mask.jpg';
        a.click();
      }
    }, 'image/jpeg', +zipNum.value); // 设置图片格式和压缩质量
  } else {
    alert('请先选择图片')
  }
}
</script>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.canvas {
  margin-top: 20px;
}
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 64px;
  padding: 0 30px;
  box-sizing: border-box;
  cursor: pointer;
}
.icon {
  width: 32px;
  height: 32px;
  color: #333;
}
input[type="file"] {
  border: 1px solid #3498db;
  background-color: #f9f9f9;
  color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  transition: border-color 0.3s ease-in-out;
}

input[type="file"] {
  outline: none;
  border-color: #2980b9;
}

input[type="file"] {
  margin-top: 20px;
  padding: 8px 15px;
  background-color: #f5f5f5;
  border-color: #95a5a6;
}

input[type="file"]::-webkit-file-upload-button {
  background-color: #3498db;
  color: #fff;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

input[type="file"]::-webkit-file-upload-button:hover {
  background-color: #2980b9;
}
button {
  margin-top: 20px;
  border: 1px solid #95a5a6;
}
</style>
