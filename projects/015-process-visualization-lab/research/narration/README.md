# MiniMax 中文讲解音频

当前正式音轨全部由 **MiniMax** 生成：`speech-2.8-hd`，音色 `Chinese (Mandarin)_Gentle_Senior`（温柔学姐），速度 `0.95`、情感 `calm`、中文增强。使用用户已授权的既有 MiniMax 配置，通过官方 `https://api.minimax.cn/v1/t2a_v2` 请求；凭据只在生成进程内存读取，不写入网页、清单、研究记录或日志。网页播放本地 WAV，不会在用户播放时调用生成 API。

正式清单为 `app/assets/narration/manifest.json`，`provider` 为 `MiniMax`。现有 52 个音频 URL 均指向 `assets/narration/minimax/` 内按音频哈希命名的 WAV。每段记录 `text`、按 PCM 样本计算的 `durationSeconds`、`sha256`、`inputHash`、`bytes`、`sampleRate`、`channels` 和 `bits`。基础讲解按 `app/narration-script.js` 的 `tourKey-index` 编号，旧金山潮汐、花莲地震和 Big Piney 实地示踪按 `app/dynamic-events.js` 的事件编号与章节序号登记。播放器按每段音轨时长和章节对应的观测时段推进画面与图表。

2026-11-04 生成的 36 段均为 **32 kHz、16-bit、单声道 PCM WAV**，共 **42,710,426 字节**（约 40.73 MiB），合计 **666.696 秒**（约 11.11 分钟）。`overview` 八段合计 **149.60 秒**（约 2 分 30 秒）；单段约 17.07—20.60 秒。首段预览被后续批次复用，36 次成功请求无重试。供应商返回的 `usage_characters` 合计 5790，与本地原文 3020 字符的统计口径不同；未取得金额账单，不能据此杜撰实际费用。

旧金山的 5 段旁白合计 **75.800 秒、4,857,020 字节**。5 份成功回执的供应商用量合计 639 字符，本地提交文本共 334 字符。

本次补录山竹的首尾 2 段、花莲的 4 段和 Big Piney 的 5 段，复用了已有 41 段。山竹原有中午章节保持原录音，章节顺序变动时按请求和音频哈希复用。全部 52 段合计 **918.729 秒、58,859,208 字节**。

- `minimax-source.json` 保存模型、音色、脚本和注册讲解哈希、官方文档、逐段请求哈希、成功时间和供应商用量元数据。
- `minimax-validation-report.json` 保存全部实际音频的 SHA-256、字节数、PCM 格式、时长、峰值和 RMS；不保存 API 密钥。

在项目根目录复现，需支持 `fetch` 的 Node.js 和已授权的外部 MiniMax 配置：

```powershell
# 只检查配置并输出非敏感参数，不调用 API。
node scripts/generate-minimax-narration.mjs --dry-run
# 正式生成；默认使用既有外部配置，也可通过 --env-file 指定配置路径。
node scripts/generate-minimax-narration.mjs
# 仅生成旧金山的讲解；请求前先核对其他章节的缓存。
node scripts/generate-minimax-narration.mjs --tour san-francisco-2025-01-15-tide
# 独立检查当前清单和实际音频；无需密钥或网络。
node scripts/check-narration.mjs
# 生成器安全边界和坏音频测试；无需密钥或网络。
node --test research/narration/minimax-generator.test.mjs
```

生成器复用了项目 003 的安全处理方式，仅向白名单中的官方 HTTPS API 主机发送凭据，禁止跳转，不输出完整服务响应。`--clip overview-0` 可只生成一段预览；`--force` 会强制重新生成并可能产生额外费用，正常续跑不要加此参数。

进度保存在 `app/assets/narration/minimax/manifest.partial.json`。请求内容哈希、文件哈希、PCM 格式与时长均一致时才命中缓存。所有正式章节通过验证且源脚本版本一致后，生成器才原子替换正式清单。检查器独立核对正文逐字一致、章节完整性、文件路径、字节数、SHA-256 与非静音信号。人工读音审查另行进行。

交付文件为：

- `app/assets/narration/manifest.json` 与 `app/assets/narration/minimax/` 下的 52 个 WAV、`manifest.partial.json`。
- `scripts/generate-minimax-narration.mjs`、`scripts/check-narration.mjs`。
- 本文、`minimax-source.json`、`minimax-validation-report.json`、`minimax-generator.test.mjs`。

此前 Windows WinRT / Microsoft Huihui 的 WAV、探针、PowerShell 生成器、导出队列与 `validation-report.json` 仅为 D staging 保留的本机试验记录，**未接入当前正式音轨，也不作为本次 E 项目的音频交付**；它们没有被删除。旧试验清单另存为 `windows-manifest.json`。不要运行旧 `generate-audio.ps1` 覆盖当前 MiniMax 清单。
