# Parsec Soda Overlay


Hi there! This is a zip file containing a stripped down version of the overlay I use when hosting with Soda.
I wanted to share this as an example of what you can do with websockets that I included in ParsecSodaV.
https://github.com/v6ooo/ParsecSoda/releases

I will most likely never finish this overlay as I quickly hack together code for whatever I need and it is always changing.
I originally made this for Mario Kart and it is set up for a 4 player splitscreen layout.

Make sure you read through all of the information below as I will provide no help further help.
If you can't figure it out, this is not for you.

<br />

## config.js
What it does:
- Config file

How to use:
- Open with notepad and edit
- Change ip, port, path, password if needed
- If you play on host, remove // from localPlayer and change name to make your name appear as player 1

<br />

## nodejs-websocket-server

Required software:
- Node.js https://nodejs.org/en/

What it does:
- Relays messages between Soda & Overlay.

How to use:
- Edit config.js if needed
- Install Node.js
- Run start.bat in folder

<br />

## web-overlay-stripped
  
Required software:
- Chrome/Chromium browser that can run in kiosk mode with hardware acceleration disabled

What it does:
- Overlay that shows chat and nametags with pings. Has a hidden menu in top left corner, click with mouse.

How to use:
- Edit config.js if needed
- Edit start.bat in notepad to point to your browser exe
- Browser must be set up to run without hardware acceleration
- Run AutoHotkey script
- Run start.bat in folder
- Press Ctrl + Windows-key + Z to make browser transparent

<br />

## overlay-script.ahk

Required software:
- AutoHotkey https://www.autohotkey.com

What it does:
- Hotkey to set transparent color for browser
- Shows a input box and send text to Soda without alt-tabbing. Requires Soda chat input box to be selected. Not 100% reliable.
- Customize by editing top portion in notepad.

How to use:
- If you don't use chrome.exe, you will need to change Line 110
- Run overlay-script.ahk (will automatically run as admin)
- Select chat input box in Soda before moving away from window
- Press Ctrl + Shift + C to open chat, enter to send, esc to cancel

Hotkeys
```
Ctrl + Shift + C            Open chat (Enter to send, Esc to cancel)
Ctrl + Windows-key + Z      Make overlay (browser) transparent
Ctrl + Windows-key + R      Reload script
```



