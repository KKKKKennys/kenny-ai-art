# 李铿 Kenny · 3D 美术与 Agent 工作流

[打开作品集网站](https://kkkkkennys.github.io/kenny-ai-art/) · [作品集 PDF · 26 页](https://kkkkkennys.github.io/kenny-ai-art/assets/files/likeng-lightai-portfolio.pdf) · [个人简历 · 2 页](https://kkkkkennys.github.io/kenny-ai-art/assets/files/likeng-lightai-resume.pdf)

展示三维作品、开源 Skills 和 Agent 工作流设计。本人负责创作方向、需求拆解、效果判断与交付检查，各项目在页面内说明具体制作分工。

## 六项作品

| 作品 | 展示重点 |
| --- | --- |
| NEREID 深海科研站 | 场景、室内、灯光、运镜与补帧复盘 |
| AK-50 硬表面武器 | 结构拆装、瞄具细节与材质 |
| 猴头｜纯手工雕刻 | 本人手工雕刻；成品图、无毛发正视白模与表情动画 |
| 聚光灯精灵 | 机械绑定、表情控制与动画 |
| 幻想风角色设计工作室 | 室内布局与客户修订 |
| 夜间室内办公室 | 夜景灯光与分层检查 |

五段视频均使用原生播放器，可暂停、拖动进度、调节声音和全屏。点击播放；深海科研站与聚光灯精灵默认开启声音，其余视频默认静音。AK-50 默认完整影片，猴头使用已确认的 9.6 秒短片。画面按原比例展示。

## Agent 工作流设计

我提出需求 → Claude Code 统筹 → Codex CLI → ComfyUI / GPT Image → 我确认图片 → Claude Code → Codex CLI → MCP → Blender → 我检查交付。

- **Codex CLI：编辑 ComfyUI 批量生图工作流，或调用 GPT Image。**
- **ComfyUI / GPT Image：按设定批量生成候选图片。**

候选登记、审批、状态管理和任务调度程序已实现；原生生图与三张候选图登记有既有实测记录。指定生图后端接入、Claude Code 主导的完整链路和 Blender 三维串联仍待验证。

[工作流原型与验证记录](https://github.com/KKKKKennys/ai-asset-workflow)

## Skills

- [Blender Asset Pipeline](https://github.com/KKKKKennys/blender-asset-pipeline)：模型命名、材质与贴图检查、导出和结果记录。
- [Camera Shot Library](https://github.com/KKKKKennys/camera-shot-library)：通过 Agent 阅读影视资料与作品整理 50 张镜头卡，再用于作品设计。
- [Kenny Scene Craft · 40 项独立场景 Skill](skills/kenny-scene-craft.html)：按制作任务浏览目录。

## 文档与预览

网站与两份 PDF 使用一致的项目名称、制作分工和验证状态。作品集中的二维码链接至对应视频，末页保留网站和微信二维码。个人简历保持两页：第一页顶部提供作品集二维码，第二页展示四项作品与接单经历，并附自我评价。

这是静态网站，发布目录为仓库根目录。`index.html` 为主页面，`assets/` 包含样式、脚本、图片、视频与下载文件；`skills/` 为 Skill 说明页。本地预览使用支持 HTTP Range 请求的静态服务器，以便视频能正常拖动进度。

美术作品与个人资料的授权不随所链接的 MIT 开源 Skill 许可证一并转移。
