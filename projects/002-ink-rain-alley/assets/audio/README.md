# 《纸上归途》原创程序配乐草案

- 为本项目创作的 64 拍循环，54 BPM，约 71.11 秒。
- 原始音符、和声、速度和固定种子记录在 `score.json`：24 个旋律音、8 组和声。
- 音色为加法合成的柔和钢琴音色与缓慢长音，并非真实钢琴录音。没有鼓、人声、外部采样、原视频音乐或音乐生成服务。
- `paper-home-master.wav` 是 32 kHz / 16-bit / 双声道母带；`paper-home.ogg` 是网页实际按需加载的循环音轨。
- `paper-home-preview.mp3` / `.wav` 为有淡入淡出的 36 秒试听节选，网页不加载试听文件。
- 公开源码保留网页OGG、MP3试听、音符与生成记录；两个WAV母版／试听文件保留本地且不纳入Git，可用下方命令重生成，不是构建或网页运行的依赖。
- `render-metrics.json` 记录本次生成的时长、峰值和 RMS。指标用于排查静音、削波和编码问题，不能证明音乐审美或情绪效果。

在子项目根目录重新生成，需要 Python、NumPy 和 ffmpeg：

```powershell
python tools/render-score.py
ffmpeg -i assets/audio/paper-home-master.wav -c:a libvorbis -q:a 5 assets/audio/paper-home.ogg
ffmpeg -i assets/audio/paper-home-preview.wav -c:a libmp3lame -b:a 128k assets/audio/paper-home-preview.mp3
```

重生成前自行选择覆盖输出；这组命令不自动覆盖同名文件。网页使用 Web Audio 对本地音轨循环播放，音乐和环境声独立混音；风、雨和水声在浏览器中合成。音轨不会因跳章而重新从头播放，环境声随场景平滑变化。

播放方式参考 [MDN：AudioBufferSourceNode.loop](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop) 与 [MDN：decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData)。本文件的音符和音色实现不来自该文档。
