原创《灯塔来信·风声回放》以正式 ProgramBuilder/Player 验证长音轨、混音、语音与自然结束等待；两条选择均为原创。assets 中四个音轨由 build-audio.mjs 的确定性正弦波通过 ffmpeg 编码，非真人语音或真实作品资料。35 秒 Vorbis 为长媒体路径验证，Opus 为正文语音身份，MP3 为自然等待，WAV 为 buffer/stop 策略。

正常构建使用提交的资源：export TMPDIR=/dev/shm，pnpm fixture。可选重新生成音轨：node fixtures/media-novel/build-audio.mjs（需要 ffmpeg）；生成后须重建摘要/manifest 并重验。运行 pnpm dev，打开 /?demo=media。
