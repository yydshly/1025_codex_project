// Only actual archived media. cost is verified task credits or null; derivatives do not double-count source fees.
export const media = [
  {
    "id": "coastal-scroll-splice-v1",
    "title": "悬崖长卷 · 11秒两段拼接版",
    "kind": "editorial-derivative",
    "src": "./assets/videos/coastal-scroll-splice-v1.mp4",
    "poster": "./assets/images/posters/coastal-scroll-splice-v1.jpg",
    "width": 1280,
    "height": 720,
    "duration": 11.041667,
    "fps": 24,
    "actualInputRole": "两条独立Kling4.0原片真实拼接：A复用前5.000秒（帧0–119），B使用全部6.041667秒（帧0–144）。B由A真实末帧生成。",
    "observation": "全片265帧，5.000秒处直接剪接。接点人物位置、车体尺度、骑行方向和脚踏姿态基本承接，从沿岸跟拍转入拉远赏景。",
    "limit": "接缝附近人物与花草纹理有轻微重绘柔化，B后段拉远幅度大，不称为严格无缝或精确运动匹配。全程接地和音轨听感尚未严格验收。",
    "taskId": null,
    "cost": null,
    "costUnit": "credits",
    "caption": "真实两片后期拼接，无循环、定格、变速、溶解或插帧。仅统一画幅1280×720与音轨采样格式；原片保留。B已确认180积分，A最终费用未确认，派生版不重复计费。",
    "sourceTaskIds": [
      "1044781",
      "1044794"
    ],
    "seamTime": 5,
    "seamImage": "./assets/images/reference/coastal-scroll-splice-v1-seam.jpg",
    "seamPreview": "./assets/videos/coastal-scroll-splice-v1-seam.mp4"
  },
  {
    "id": "coastal-scroll-kling4-b-v1",
    "title": "悬崖长卷 · B续骑原片（Kling4.0）",
    "kind": "ai-original",
    "src": "./assets/videos/coastal-scroll-kling4-b-v1.mp4",
    "poster": "./assets/images/posters/coastal-scroll-kling4-b-v1.jpg",
    "width": 1284,
    "height": 724,
    "duration": 6.041667,
    "fps": 24,
    "actualInputRole": "A片的真实末帧（第120帧）作为B的首帧；Kling4.0首尾帧模式仅传首帧，加续骑与摄影连续指令。没有传尾帧或原作视频。",
    "observation": "开头人物与车体基本承接A末状态，继续向右骑行；后段明显拉远、升高，把主要画面留给海湾。",
    "limit": "首帧仍有少量人物和草地重绘、柔化；拉远幅度大于轻微升高的设计。后段人物变小且有遮挡，轮地接触未严格验证；音轨未听验。",
    "taskId": "1044794",
    "cost": 180,
    "costUnit": "credits",
    "caption": "新增6秒原片，实际6.041667秒、145帧、24fps、1284×724，原速保留。实际180积分已由任务查询确认。",
    "sourceTaskIds": [
      "1044794"
    ]
  },
  {
    "id": "coastal-scroll-kling4-v1",
    "title": "悬崖长卷 · A横向跟拍原片（Kling4.0）",
    "kind": "ai-original",
    "src": "./assets/videos/coastal-scroll-kling4-v1.mp4",
    "poster": "./assets/images/posters/coastal-scroll-kling4-v1.jpg",
    "width": 1284,
    "height": 724,
    "duration": 5.041667,
    "fps": 24,
    "actualInputRole": "ChatArt网页选用Kling4.0参考生视频，一张悬崖长卷概念图加与Seedance对照相同的运动提示词；未提供尾帧或原作视频。",
    "observation": "横向骑行和侧后方跟拍可辨认；近处花石依次掠过，远处海岸移动较慢，人物尺度比本次Seedance对照更稳定，风景持续占主要面积。",
    "limit": "约0.75–2.5秒轮胎被花草遮挡，是否始终沿原土路、全程接地仍无法完全确认；未见对照样片那样明确的短暂腾起。单次样本不证明模型普遍排名，音轨未听验。",
    "taskId": "1044781",
    "cost": null,
    "costUnit": "credits",
    "caption": "720p档原生输出实际为1284×724、121帧、24fps、5.041667秒，保留原速与音轨，无剪辑/变速/插帧。网页预估150积分；任务查询成本字段N/A，最终费用未确认。",
    "sourceTaskIds": [
      "1044781"
    ]
  },
  {
    "id": "coastal-scroll-seedance2-v1",
    "title": "悬崖长卷 · Seedance 2.0 对照",
    "kind": "ai-original",
    "src": "./assets/videos/coastal-scroll-seedance2-v1.mp4",
    "poster": "./assets/images/posters/coastal-scroll-seedance2-v1.jpg",
    "width": 1280,
    "height": 720,
    "duration": 5.088,
    "fps": 24,
    "actualInputRole": "一张《悬崖长卷》概念图作为世界、骑手与开场构图参考，加横向骑行、侧后方平行跟拍和分层视差文字指令；未提供尾帧或原作视频。",
    "observation": "向右骑行、侧后转侧面跟拍和近花石快移、远崖慢移均可辨认，景观持续占主体。",
    "limit": "约0.25–1秒跨入路外花坡，0.5秒附近短暂离地；镜头也持续靠近，未完全满足全程接地和匀距跟拍。完整10秒方案未验证，音轨未听验。",
    "taskId": "1044756",
    "cost": 75,
    "costUnit": "credits",
    "caption": "Seedance 2.0 标准模型原速原片，无剪辑、变速或插帧。视频轨5.041667秒、121帧，含音轨的文件时长5.088秒；实际75积分，原预估90。",
    "sourceTaskIds": [
      "1044756"
    ]
  },
  {
    "id": "static-720",
    "title": "固定远景 · 720p",
    "kind": "ai-original",
    "src": "./assets/videos/static-720.mp4",
    "poster": "./assets/images/posters/static-720.jpg",
    "width": 1280,
    "height": 720,
    "duration": 5.041667,
    "fps": 24.0,
    "actualInputRole": "一张本轮 AI 风景图作为首帧，加固定广角、轻微环境与骑行动作提示词；原参考视频仅供人工分析。",
    "observation": "骑车人沿草坡前进，景观整体保持稳定。",
    "limit": "固定远景、小人物的实际指令没有复现原片从远到近的跟拍变化。",
    "taskId": "1044252",
    "cost": null,
    "costUnit": "credits",
    "caption": "原始 AI 输出，保留生成音轨；费用未核实。",
    "sourceTaskIds": [
      "1044252"
    ]
  },
  {
    "id": "static-1080",
    "title": "固定远景 · 1080p",
    "kind": "ai-original",
    "src": "./assets/videos/static-1080.mp4",
    "poster": "./assets/images/posters/static-1080.jpg",
    "width": 1916,
    "height": 1080,
    "duration": 5.041667,
    "fps": 24.0,
    "actualInputRole": "同一张本轮 AI 风景首帧及固定广角动作提示词，使用 Seedance 2.0 完整版的 1080p 档位。",
    "observation": "实际文件为 1916×1080，人物前进、建筑与海岸整体保持。",
    "limit": "分辨率提高没有改变固定远景的运动设计，不能等同于复制参考片的运镜。",
    "taskId": "1044280",
    "cost": 150,
    "costUnit": "credits",
    "caption": "原始 AI 输出；150 积分为本轮查询已返回的实际值，高于当时 120 积分预估。",
    "sourceTaskIds": [
      "1044280"
    ]
  },
  {
    "id": "motion-native",
    "title": "首尾帧运动实验 · AI 原片",
    "kind": "ai-original",
    "src": "./assets/videos/motion-native.mp4",
    "poster": "./assets/images/posters/motion-native.jpg",
    "width": 1280,
    "height": 720,
    "duration": 5.041667,
    "fps": 24.0,
    "actualInputRole": "本轮生成的风景图与近距离骑手图分别作为首尾帧，加接近、跟拍、转弯和视差提示词；原参考视频没有作为视频输入传给模型。",
    "observation": "用实际原片观察首尾帧引导下的人物尺度、镜头接近和跟随变化。",
    "limit": "提示词中的分段时间与目标尺度是设计目标，不能当作已经精确实现的效果。",
    "taskId": "1044377",
    "cost": null,
    "costUnit": "credits",
    "caption": "原始 AI 输出；与剪辑变速版共用一个生成任务，实际费用未核实。",
    "sourceTaskIds": [
      "1044377"
    ]
  },
  {
    "id": "motion-paced",
    "title": "首尾帧运动实验 · 节奏剪辑",
    "kind": "editorial-derivative",
    "src": "./assets/videos/motion-paced.mp4",
    "poster": "./assets/images/posters/motion-paced.jpg",
    "width": 1280,
    "height": 720,
    "duration": 3.791667,
    "fps": 24.0,
    "actualInputRole": "复用 motion-native 原片；将原片 0–2.5 秒按 2 倍速播放，其余保持 1 倍速。",
    "observation": "成片约 3.79 秒，前段接近过程更紧凑。",
    "limit": "这是剪辑变速派生和静音预览，不是模型原生速度变化，也没有新增 AI 生成任务。",
    "taskId": "1044377",
    "cost": null,
    "costUnit": "credits",
    "caption": "剪辑派生；底片费用见原片，不重复计费。",
    "sourceTaskIds": [
      "1044377"
    ]
  },
  {
    "id": "shot-a",
    "title": "完整创作 · A 接近与跳跃",
    "kind": "ai-original",
    "src": "./assets/videos/shot-a.mp4",
    "poster": "./assets/images/posters/shot-a.jpg",
    "width": 1280,
    "height": 720,
    "duration": 5.041667,
    "fps": 24.0,
    "actualInputRole": "本轮新生成的 START 与 APEX 图作首尾帧，加接近山脊、压缩、短跳开景的实际提示词。",
    "observation": "密集审片：约 2.833–2.917 秒双轮离地，视觉高点约 3.25–3.75 秒，4.667–4.75 秒落地；2.75 秒只是前轮抬起。",
    "limit": "模型没有按尾帧停在空中顶点；跳跃高度偏夸张，预压和落地吸收仍较弱。",
    "taskId": "1044472",
    "cost": 75,
    "costUnit": "credits",
    "caption": "原始 AI 输出；75 积分已由任务查询确认。",
    "sourceTaskIds": [
      "1044472"
    ]
  },
  {
    "id": "shot-b",
    "title": "完整创作 · B 落地与续骑",
    "kind": "ai-original",
    "src": "./assets/videos/shot-b.mp4",
    "poster": "./assets/images/posters/shot-b.jpg",
    "width": 1280,
    "height": 720,
    "duration": 5.041667,
    "fps": 24.0,
    "actualInputRole": "本轮新生成的 APEX 与 END 图作首尾帧，加重力下降、轮胎接地、身体吸收和沿弯路续骑的提示词。",
    "observation": "约 0.375–0.5 秒落地，0.625–0.75 秒身体压缩，随后继续下坡骑行。",
    "limit": "A 已在末尾落地，直接接 B 的空中首帧会重复跳跃；最终剪辑改从 B 的 0.75 秒进入。",
    "taskId": "1044477",
    "cost": null,
    "costUnit": "credits",
    "caption": "原始 AI 输出；查询成本字段 N/A，实际扣费未知。",
    "sourceTaskIds": [
      "1044477"
    ]
  },
  {
    "id": "complete-ride",
    "title": "越过山脊，看见海湾",
    "kind": "editorial-derivative",
    "src": "./assets/videos/complete-ride.mp4",
    "poster": "./assets/images/posters/complete-ride.jpg",
    "width": 1280,
    "height": 720,
    "duration": 8.375,
    "fps": 24.0,
    "actualInputRole": "A、B 两段真实 AI 原片的剪辑派生：A 中段腾空按 2 倍速压缩，B 从 0.75 秒后进入，落地后明确换机位。",
    "observation": "8.375 秒完整短片：接近山脊、跳跃开景、落地、换景别继续骑行。",
    "limit": "4.083 秒处人物尺度、地形与色彩有可见变化；不是原生单镜头，未新增 AI 生成或插帧；音轨只做数值检查，未听音。",
    "taskId": null,
    "cost": null,
    "costUnit": "credits",
    "caption": "完整节奏剪辑版。A 已核实 75 积分，B 未核实，总费用未知。",
    "sourceTaskIds": [
      "1044472",
      "1044477"
    ]
  }
];

export const keyframes = [
  {
    "id": "start",
    "title": "START · 被山脊遮住的海湾",
    "src": "./assets/images/keyframes/start.webp",
    "width": 1672,
    "height": 941,
    "role": "起点：贴地接近，低山脊遮住部分海湾",
    "caption": "本轮 AI 生成的动作参考图；不代表最终视频已精确遵守该姿态。",
    "archive": "../assets/images/keyframes/start.png"
  },
  {
    "id": "apex",
    "title": "APEX · 跳跃开景",
    "src": "./assets/images/keyframes/apex.webp",
    "width": 1672,
    "height": 941,
    "role": "动作参照：短跳顶点，海湾打开，可见后续落地道路",
    "caption": "本轮 AI 生成的动作参考图；不代表最终视频已精确遵守该姿态。",
    "archive": "../assets/images/keyframes/apex.png"
  },
  {
    "id": "end",
    "title": "END · 落地后续骑",
    "src": "./assets/images/keyframes/end.webp",
    "width": 1672,
    "height": 941,
    "role": "落点：同一路线继续前进，景观仍为主体",
    "caption": "本轮 AI 生成的动作参考图；不代表最终视频已精确遵守该姿态。",
    "archive": "../assets/images/keyframes/end.png"
  }
];

export const references = [
  {
    "id": "source-full-timeline",
    "title": "原片全时长时间轴",
    "src": "./assets/images/reference/source-full-timeline.jpg",
    "width": 1920,
    "height": 1242,
    "author": "Personality (@hi_personality)",
    "sourceUrl": "https://x.com/hi_personality/status/2115567493565825244",
    "licenseStatus": "第三方许可状态未知，未声明 CC 授权",
    "caption": "原片约 7 秒，每 0.5 秒采样并补片尾。该早期分析图未做 HLG→SDR 映射，只用于观察动作、构图和时间顺序。"
  },
  {
    "id": "source-vs-result-motion",
    "title": "原片与固定远景成片的运动对照",
    "src": "./assets/images/reference/source-vs-result-motion.png",
    "width": 1680,
    "height": 775,
    "author": "Personality (@hi_personality)",
    "sourceUrl": "https://x.com/hi_personality/status/2115567493565825244",
    "licenseStatus": "第三方许可状态未知，未声明 CC 授权",
    "caption": "原片采样帧已作 HLG→SDR 分析映射；双方各自时间标记用于比较镜头与尺度变化，不等同于在 HDR 显示器上比较亮度。"
  }
];

export const sourceReference = {
  "title": "grassland special",
  "author": "Personality (@hi_personality)",
  "url": "https://x.com/hi_personality/status/2115567493565825244",
  "duration": 6.976,
  "width": 1920,
  "height": 1080,
  "fps": 60,
  "colorPrimaries": "bt2020",
  "colorTransfer": "arib-std-b67 (HLG)",
  "colorMatrix": "bt2020nc",
  "pixFmt": "yuv420p",
  "nativeGenerationFpsConfirmed": false,
  "sourceModelConfirmed": false,
  "sourceCodeRepositoryConfirmed": false,
  "fullSourceVideoPublished": false,
  "caption": "仅引用原帖与已分析时间轴；60fps 和 HLG/BT.2020 是已下载文件的标记，不证明作者原生生成帧率、具体模型或源码已公开。"
};

export const conceptVisuals = [
  {
    "id": "coastal-scroll",
    "title": "沿海长卷",
    "kind": "ai-concept-image",
    "origin": "AI-generated-concept",
    "src": "./assets/images/concepts/coastal-scroll.webp",
    "width": 1672,
    "height": 941,
    "caption": "本轮生成的 AI 概念静帧，已用于A段运动原片；现有11.04秒两段拼接试片，完整方案仍待验证。",
    "observation": "侧后方骑手、前景花石和横向展开的海湾拱廊构成沿海长卷。",
    "limit": "已有两段拼接试片体现横向跟拍与视差；接缝有轻微重绘，后段拉远明显，接地仍需复核。静帧本身不证明运动质量。",
    "provenance": {
      "method": "built-in-image-gen",
      "promptFile": "../research/concept-prompts.json",
      "promptId": "coastal-scroll",
      "referenceImage": "./assets/images/keyframes/end.webp",
      "referenceRole": "视觉世界、骑手外观、自然材质与光线参考；不是精确视频首帧",
      "sourceArchive": "../assets/images/concepts-source/coastal-scroll.png"
    }
  },
  {
    "id": "inner-sea",
    "title": "门里的另一片海",
    "kind": "ai-concept-image",
    "origin": "AI-generated-concept",
    "src": "./assets/images/concepts/inner-sea.webp",
    "width": 1672,
    "height": 941,
    "caption": "本轮新生成的 AI 概念静帧，尚未生成该方向的视频。",
    "observation": "巨型带铰链石门部分开启，门外海湾与门内另一片海湾同框，骑手提供尺度。",
    "limit": "门的重量、铰链运动及内外空间连续性仍需动态验证。",
    "provenance": {
      "method": "built-in-image-gen",
      "promptFile": "../research/concept-prompts.json",
      "promptId": "inner-sea",
      "referenceImage": "./assets/images/keyframes/end.webp",
      "referenceRole": "视觉世界、骑手外观、自然材质与光线参考；不是精确视频首帧",
      "sourceArchive": "../assets/images/concepts-source/inner-sea.png"
    }
  },
  {
    "id": "reflection-first",
    "title": "倒影先开门",
    "kind": "ai-concept-image",
    "origin": "AI-generated-concept",
    "src": "./assets/images/concepts/reflection-first.webp",
    "width": 1672,
    "height": 941,
    "caption": "本轮新生成的 AI 概念静帧，尚未生成该方向的视频。",
    "observation": "实体石门闭合，水中对应位置出现开启的门与蓝色海湾，二者同框。",
    "limit": "倒影采用魔法式表达，几何不是严格的光学镜像；开门先后顺序仍需视频验证。",
    "provenance": {
      "method": "built-in-image-gen",
      "promptFile": "../research/concept-prompts.json",
      "promptId": "reflection-first",
      "referenceImage": "./assets/images/keyframes/end.webp",
      "referenceRole": "视觉世界、骑手外观、自然材质与光线参考；不是精确视频首帧",
      "sourceArchive": "../assets/images/concepts-source/reflection-first.png"
    }
  },
  {
    "id": "seed-islands",
    "title": "种子托起草岛",
    "kind": "ai-concept-image",
    "origin": "AI-generated-concept",
    "src": "./assets/images/concepts/seed-islands.webp",
    "width": 1672,
    "height": 941,
    "caption": "本轮新生成的 AI 概念静帧，尚未生成该方向的视频。",
    "observation": "单颗蒲公英种子连接带草皮与小石拱的浮岛，骑手在地面道路经过。",
    "limit": "图中浮岛较显眼，掌心大小的精确尺度没有得到可靠表达；漂浮与骑行关系尚未动态验证。",
    "provenance": {
      "method": "built-in-image-gen",
      "promptFile": "../research/concept-prompts.json",
      "promptId": "seed-islands",
      "referenceImage": "./assets/images/keyframes/end.webp",
      "referenceRole": "视觉世界、骑手外观、自然材质与光线参考；不是精确视频首帧",
      "sourceArchive": "../assets/images/concepts-source/seed-islands.png"
    }
  },
  {
    "id": "pedal-city",
    "title": "踏动唤醒拱廊",
    "kind": "ai-concept-image",
    "origin": "AI-generated-concept",
    "src": "./assets/images/concepts/pedal-city.webp",
    "width": 1672,
    "height": 941,
    "caption": "本轮新生成的 AI 概念静帧，尚未生成该方向的视频。",
    "observation": "暮光海湾中，一段拱廊明显呈暖金色，前后大部分建筑处于较暗环境，骑手沿路前行。",
    "limit": "其他区域仍有零散灯光，未严格满足只有单一连续段点亮；踏动触发灯光的因果尚未动态验证。",
    "provenance": {
      "method": "built-in-image-gen",
      "promptFile": "../research/concept-prompts.json",
      "promptId": "pedal-city",
      "referenceImage": "./assets/images/keyframes/end.webp",
      "referenceRole": "视觉世界、骑手外观、自然材质与光线参考；不是精确视频首帧",
      "sourceArchive": "../assets/images/concepts-source/pedal-city.png"
    }
  },
  {
    "id": "miniature-bay",
    "title": "石洼中的微缩海湾",
    "kind": "ai-concept-image",
    "origin": "AI-generated-concept",
    "src": "./assets/images/concepts/miniature-bay.webp",
    "width": 1672,
    "height": 941,
    "caption": "本轮新生成的 AI 概念静帧，尚未生成该方向的视频。",
    "observation": "自然石洼边缘环抱熟悉的海湾、白崖和微小骑手，外围花草提供微缩尺度线索。",
    "limit": "这是拉远揭示结果的概念静帧，真实相机拉远和尺度转换尚未生成或验证。",
    "provenance": {
      "method": "built-in-image-gen",
      "promptFile": "../research/concept-prompts.json",
      "promptId": "miniature-bay",
      "referenceImage": "./assets/images/keyframes/end.webp",
      "referenceRole": "视觉世界、骑手外观、自然材质与光线参考；不是精确视频首帧",
      "sourceArchive": "../assets/images/concepts-source/miniature-bay.png"
    }
  },
  {
    "id": "seasonal-gate",
    "title": "穿过季节的门",
    "kind": "ai-concept-image",
    "origin": "AI-generated-concept",
    "src": "./assets/images/concepts/seasonal-gate.webp",
    "width": 1672,
    "height": 941,
    "caption": "本轮新生成的 AI 概念静帧，尚未生成该方向的视频。图像与当前基础设计已统一为夏→冬过渡。",
    "observation": "同一拱门前是暖阳草地，门后是雪地、结霜树木和冬季海湾，骑手驶向门。",
    "limit": "季节变化目前仅为概念静帧；穿门时的地理对应、人物装备和路面接触仍需视频验证。",
    "provenance": {
      "method": "built-in-image-gen",
      "promptFile": "../research/concept-prompts.json",
      "promptId": "seasonal-gate",
      "referenceImage": "./assets/images/keyframes/end.webp",
      "referenceRole": "视觉世界、骑手外观、自然材质与光线参考；不是精确视频首帧",
      "sourceArchive": "../assets/images/concepts-source/seasonal-gate.png"
    }
  }
];
