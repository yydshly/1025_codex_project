# MiniMax 中文讲解

当前运行的13段讲解来自项目原创脚本 `../replica-script.js` 的 `narrationClips` 清单，使用 MiniMax `speech-2.8-hd`、官方系统音色 `Chinese (Mandarin)_Gentle_Senior`（温柔学姐），语速0.95、calm情绪。生成日期2026-10-26；WAV为32 kHz、16-bit、单声道，总时长151.5秒。不是原作者配音，也未克隆任何人的声音。

## 生成与凭据

默认运行 `npm run voice`，只在命令行进程中读取外部 `F:/codex_project/.env.minimax` 的 `MINIMAX_API_KEY` 与 `MINIMAX_API_BASE`。可用 `--env-file` 指定其他位置。配置文件不复制到项目，密钥不写入音频、manifest、前端模块或日志。

```powershell
npm.cmd run voice
npm.cmd run voice -- --env-file F:/codex_project/.env.minimax
npm.cmd run voice -- --clip types
npm.cmd run voice -- --force
```

`--clip` 可先生成单段预览；全套通过后才发布。`--force` 会重新调用API生成指定范围，需要有效配额；不带此参数会按文本和全部请求参数的哈希复用缓存。

输出在 `minimax/`；文件名含音频内容哈希，`manifest.json` 保存无凭据的模型、音色、音频格式和校验信息。只有全部13段与当前脚本匹配，才更新 `../narration-source.js`。请求或音频校验失败时不切换正在使用的整套配音。运行页面只读取生成好的本地WAV，不调用MiniMax API。

## 历史音频

原先Windows Microsoft Huihui Desktop生成的WAV仍保留在本目录根部，当前页面不再引用。`npm run voice:windows` 仅重建这些历史文件，不会将当前页面切回Windows配音。目录文件数不等于运行清单的段数。

## 来源与验证

- [MiniMax同步语音合成](https://platform.minimax.cn/docs/api-reference/speech-t2a-http)
- [官方系统音色](https://platform.minimax.cn/docs/faq/system-voice-id)
- [错误码](https://platform.minimax.cn/docs/api-reference/errorcode)

脚本校验HTTP、提供方状态、完成标记、hex数据及WAV结构；全部音频已解码核对声道、采样率、时长和非静音信号。平台服务、系统音色及输出使用受提供方条款约束；本项目未给MiniMax语音引擎另行声明开源授权。
