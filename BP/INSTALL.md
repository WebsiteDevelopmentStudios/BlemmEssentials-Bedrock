# Blemm Essentials — Installation Guide

## Requirements
- Minecraft Bedrock Edition 1.26.0 or newer
- A world/server with Script API support enabled

## Install
1. Download the `.mcaddon` file from the repository's Releases page (or download the build artifact from Actions).
2. Open the `.mcaddon` to import it into Minecraft.
3. Enable both **Blemm Essentials BP** and **Blemm Essentials RP** in the world's Add-Ons settings.
4. Ensure Script API / Beta APIs are enabled if your platform requires them.
5. Grant operator permissions to admins.

## Commands
Commands are available as `/be:<command>` and the legacy `!<command>` chat aliases where supported. If chat aliases are blocked by your server version, use `/scriptevent be:<command>` as a fallback.

## Troubleshooting
- Check Content Log for Script API errors.
- Make sure both packs are enabled and their versions match.
- For dedicated servers, restart the server after changing pack files.
