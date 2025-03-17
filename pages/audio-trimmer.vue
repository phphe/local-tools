<template>
  <div class="mt-4">
    <h1 class="text-2xl">{{ t("toolName") }}</h1>
    <div class="mt-4">
      <FileInput accept="audio/*" @change="handleFileChange" />
    </div>
    <h2 class="text-lg mt-4" v-if="currentFile">
      {{ currentFile!.name }} -
      <span class="text-sm italic">{{ duration.toFixed(2) }}s</span>
    </h2>
    <div v-show="currentFile" class="mt-4">
      <div ref="waveformRef" class="relative">
        <div id="waveform"></div>
      </div>
      <div class="mt-4 flex items-center gap-2">
        <Btn size="sm" @click="togglePlay">
          {{ isPlaying ? t("pause") : t("play") }}
        </Btn>
        <Btn size="sm" @click="togglePlayRegion">
          {{ t("playRegion") }}
        </Btn>
        <Btn size="sm" @click="trim">{{ t("trim") }}</Btn>
        <span class="ml-2">
          {{ t("zoom") }}:
          <input
            type="range"
            min="10"
            max="1000"
            v-model="zoomValue"
            @input="zoom"
          />
        </span>
        <div class="ml-2 text-sm">
          {{ t("startTime") }}: {{ startTime.toFixed(2) }}s {{ t("endTime") }}:
          {{ endTime.toFixed(2) }}s {{ t("duration") }}:
          {{ selectionDuration.toFixed(2) }}s
        </div>
      </div>
    </div>
    <!-- 添加历史记录表格 -->
    <div v-if="trimHistory.length" class="mt-6">
      <h2 class="text-lg mb-2">{{ t("trimHistory") }}</h2>
      <div class="overflow-x-auto">
        <table
          class="min-w-full border-collapse border border-gray-300 dark:border-gray-700"
        >
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th
                class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700"
              >
                {{ t("fileName") }}
              </th>
              <th
                class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700"
              >
                {{ t("startTime") }}
              </th>
              <th
                class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700"
              >
                {{ t("endTime") }}
              </th>
              <th
                class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700"
              >
                {{ t("duration") }}
              </th>
              <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in trimHistory"
              :key="item.timestamp"
              class="border-b border-gray-300 dark:border-gray-700"
            >
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700"
              >
                {{ item.fileName }}
              </td>
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700"
              >
                {{ item.startTime.toFixed(2) }}s
              </td>
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700"
              >
                {{ item.endTime.toFixed(2) }}s
              </td>
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700"
              >
                {{ item.duration.toFixed(2) }}s
              </td>
              <td class="py-2 px-4 whitespace-nowrap">
                <Btn
                  size="sm"
                  color="primary"
                  class="mr-2"
                  @click="downloadAudio(item)"
                >
                  {{ t("download") }}
                </Btn>
                <Btn
                  size="sm"
                  color="danger"
                  @click="trimHistory.splice(index, 1)"
                >
                  {{ t("delete") }}
                </Btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("toolName"),
});

const audioSrc = ref("");
const isPlaying = ref(false);
const startTime = ref(0);
const endTime = ref(0);
const duration = ref(0);
const selectionDuration = computed(() => endTime.value - startTime.value);
const currentFile = ref<File | null>(null);
let audioFile: File | null = null;

const waveformRef = ref<HTMLElement>();
let wavesurfer: WaveSurfer | null = null;
let regions: RegionsPlugin | null = null;

// 初始化波形显示
const initWavesurfer = () => {
  if (!waveformRef.value) return;

  wavesurfer?.destroy();
  // Initialize the Regions plugin
  regions = RegionsPlugin.create();
  wavesurfer = WaveSurfer.create({
    container: "#waveform",
    waveColor: "teal",
    progressColor: "#2c5282",
    cursorColor: "#2c5282",
    height: 100,
    normalize: true,
    plugins: [regions],
  });

  // 加载完成后设置持续时间
  wavesurfer.on("ready", () => {
    duration.value = wavesurfer!.getDuration();
    startTime.value = duration.value * 0.2;
    endTime.value = duration.value * 0.8;
    // 创建初始选区
    regions!.addRegion({
      id: "trim-region",
      start: startTime.value,
      end: endTime.value,
      color: "rgba(59, 130, 246, 0.3)",
      drag: true,
      resize: true,
    });
  });

  // 监听选区更新
  regions.on("region-updated", (region) => {
    startTime.value = region.start;
    endTime.value = region.end;
  });

  // 播放状态变化
  wavesurfer.on("play", () => (isPlaying.value = true));
  wavesurfer.on("pause", () => (isPlaying.value = false));

  // 点击波形时设置开始时间
  wavesurfer.on("click", (time: number) => {
    if (time < endTime.value) {
      startTime.value = time;
    }
  });
};

// 修改文件选择处理
const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    audioFile = file;
    audioSrc.value = URL.createObjectURL(file);
    // 重置状态
    startTime.value = 0;
    isPlaying.value = false;

    nextTick(() => {
      initWavesurfer();
      wavesurfer?.loadBlob(file);
    });
  }
};

// 修改播放/暂停控制
const togglePlay = () => {
  wavesurfer?.playPause();
};

// 播放/暂停选区
const togglePlayRegion = () => {
  if (!wavesurfer || !regions) return;
  const region = regions.getRegions().find((r) => r.id === "trim-region");
  if (region) {
    if (isPlaying.value) {
      wavesurfer.pause();
    } else {
      region.play(true);
    }
  }
};

// 添加剪辑历史记录数组
interface TrimHistory {
  blob: Blob;
  fileName: string;
  startTime: number;
  endTime: number;
  duration: number;
  timestamp: number;
}
const trimHistory = ref<TrimHistory[]>([]);

// 修改 trim 函数
const trim = async () => {
  const audioContext = new AudioContext();
  const response = await fetch(URL.createObjectURL(audioFile!));
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;
  const startOffset = Math.floor(startTime.value * sampleRate);
  const endOffset = Math.floor(endTime.value * sampleRate);
  const frameCount = endOffset - startOffset;

  const trimmedBuffer = audioContext.createBuffer(
    channels,
    frameCount,
    sampleRate
  );
  for (let channel = 0; channel < channels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const trimmedData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      trimmedData[i] = channelData[startOffset + i];
    }
  }
  const trimmedAudio = audioBufferToWav(trimmedBuffer);
  let trimmedBlob = new Blob([trimmedAudio], { type: "audio/wav" });

  // 添加到历史记录
  trimHistory.value.unshift({
    blob: trimmedBlob,
    fileName: audioFile?.name || "untitled",
    startTime: startTime.value,
    endTime: endTime.value,
    duration: endTime.value - startTime.value,
    timestamp: Date.now(),
  });
};
const createWavHeader = (
  samples: number,
  sampleRate: number,
  channels: number
) => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  const writeString = (
    view: DataView<ArrayBuffer>,
    offset: number,
    string: string
  ) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const bytesPerSample = 2; // 16位采样
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * bytesPerSample; // 实际数据大小

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true); // 使用实际的声道数
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  return buffer;
};

const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
  const channels = audioBuffer.numberOfChannels; // 使用实际的声道数
  const length = audioBuffer.length * channels;
  const interleaved = new Float32Array(length);

  // 根据实际声道数进行交织
  if (channels === 1) {
    // 单声道直接复制
    const channelData = audioBuffer.getChannelData(0);
    interleaved.set(channelData);
  } else {
    // 多声道交织
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < channels; channel++) {
        interleaved[i * channels + channel] =
          audioBuffer.getChannelData(channel)[i];
      }
    }
  }

  const samples = new Int16Array(interleaved.length);
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const dataView = createWavHeader(
    audioBuffer.length,
    audioBuffer.sampleRate,
    channels
  );
  return new Blob([dataView, samples.buffer], { type: "audio/wav" });
};

const downloadAudio = (item: TrimHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.fileName}_${item.startTime.toFixed(
    2
  )}-${item.endTime.toFixed(2)}.wav`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const zoomValue = ref(10);
const zoom = (e: Event) => {
  waveformRef.value;
  wavesurfer!.zoom(zoomValue.value);
};

// 检查浏览器兼容性
const checkBrowserSupport = () => {
  const requirements = {
    audioContext: "AudioContext" in window || "webkitAudioContext" in window,
    blob: "Blob" in window,
    dataView: "DataView" in window,
  };

  const unsupported = Object.entries(requirements)
    .filter(([, supported]) => !supported)
    .map(([name]) => name);
  if (unsupported.length > 0) {
    alert(t("browserNotSupported"));
    return false;
  }
  return true;
};

// 在组件挂载时检查
onMounted(() => {
  checkBrowserSupport();
});

// 组件卸载时清理
onUnmounted(() => {
  wavesurfer?.destroy();
});
</script>

<style>
#waveform {
  background: #f3f4f6;
  border-radius: 4px;
}
.dark #waveform {
  background: #cacaca;
}
</style>

<i18n lang="yaml">
en:
  toolName: "Audio Trimmer"
  play: "Play"
  pause: "Pause"
  playRegion: "Play Region"
  pauseRegion: "Pause Region"
  trim: "Trim"
  download: "Download"
  clear: "Clear"
  startTime: "Start Time"
  endTime: "End Time"
  trimHistory: "Trim History"
  fileName: "File Name"
  duration: "Duration"
  actions: "Actions"
  delete: "Delete"
  zoom: "Zoom"
zh:
  toolName: "音频剪辑器"
  play: "播放"
  pause: "暂停"
  playRegion: "播放选区"
  trim: "剪辑"
  download: "下载"
  clear: "清空"
  startTime: "开始时间"
  endTime: "结束时间"
  trimHistory: "剪辑历史"
  fileName: "文件名"
  duration: "时长"
  actions: "操作"
  delete: "删除"
  zoom: "缩放"
</i18n>
