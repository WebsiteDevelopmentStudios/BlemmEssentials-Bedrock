# BlemmEssentials Bedrock

Minecraft Bedrock addon source and compatibility fixes.

## 26.52 command troubleshooting

The addon intercepts player chat to support `!` commands. If commands do not run, enable the required Script API / Beta APIs experiments for the world and inspect Minecraft's Content Log for `[BE]` errors.

Run the JavaScript syntax check locally with `node --check BP/scripts/main.js`.
