# Parsec Soda Overlay

Personal desktop overlay for ParsecSodaV https://github.com/v6ooo/ParsecSoda

Uses WebSockets to communicate between SodaV and Overlay.

<br>

### Features

- Nametags with network latency
- Chat overlay
- Chat input. [See Limitations](#limitations)
- Emoji Chat wheel for 4 first gamepads. [See Limitations](#limitations)

<br>

### Requirements
- Node.js https://nodejs.org/en/
- AutoHotkey https://www.autohotkey.com/
- Web browser with kiosk-mode, and hardware acceleration disabled. Preferably Chromium-based

<br>

### Limitations
- Games must be in windowed mode/borderless fullscreen as the Overlay is just a browser window that is transparent and Always on Top.

- Chat input relies on AutoHotkey and the Chat box must be selected in SodaV before leaving the window in background. It will not be able to block keyboard input in all games.

- Chat wheel relies on the Gamepad API of your Browser and has a limit of 4 gamepads. The gamepad indexes may differ from SodaV.

- In games where the slots are assigned on a first-come first-served basis, you will need to move windows around to match the players.

<br>

### Install

Click the green Code button and Download ZIP. Unpack into folder that does not require elevated permissions.

<br>

### Configure

Open **config.js** and change whatever settings you want to adjust.

Open **start-web-overlay.bat** and change `set exepath=` to point to your browser.

If you wish to open the Browser on a different monitor.
On Chromium add `--window-position=x,y` E.g. Two 1080p monitors, second one to the right would be `1920,0`

You will need to manually edit javascript files if you wish to customize anything past config.js and the Overlay menu.

<br>

### Run / Use

[See Configure](#configure) first

- Start overlay-script.ahk
- Start nodejs-websocket-server
- Start web-overlay
 - Press Ctrl + Windows-key + Z (toggle transparency)
- Start SodaV and connect to WebSocket server

<br>

Use your mouse to control the Overlay. There is a hidden menu button in the top left corner of your screen.

Nametags and chat wheel are in movable **player screen** windows. You can adjust the position with click and drag.
If you change the position of Nametags or chat wheels in the overlay menu, you will need to select it again after moving windows.

Chat wheel selection is always handled with the Right analog stick. The only thing that differs is how you show and select on the wheel.

AutoHotkey hotkeys
```
Ctrl + Shift + C            Open chat input. Enter to send, Esc to cancel
Ctrl + Windows-key + Z      Toggle Browser transparency and Always on Top
Ctrl + Windows-key + R      Reload AutoHotkey script
```
