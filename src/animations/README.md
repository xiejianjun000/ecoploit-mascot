# Lottie 动画文件目录

设计团队将 After Effects 动画通过 Bodymovin 插件导出后，将 JSON 文件放在此目录。

## 文件命名规范

```
e_idle.json       - 待机动画
e_listening.json  - 聆听动画
e_thinking.json   - 思考动画
e_answering.json  - 应答动画
e_warning.json    - 提醒动画
e_alert.json      - 警报动画
e_success.json    - 成功动画
e_error.json      - 错误动画
e_sleep.json      - 休眠动画
```

## 加载逻辑

- 组件会自动尝试加载对应状态的 Lottie JSON
- 如果文件不存在，自动降级到 SVG + CSS 动画方案
- 设计师可逐步替换，不影响已上线的功能

## 文件大小建议

单个动画文件建议控制在 50-150KB，10 个状态总计约 1MB。
