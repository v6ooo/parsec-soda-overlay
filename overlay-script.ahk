;
;	Hook keyboard input and send it to Parsec Soda.
;
;	The chat input box must be selected in Soda for it to work.
;	Only 99% reliable. It may miss to send a chat message
;	Will not be able to prevent input from all apps.
;
;	Ctrl+Shift+C to activate
;	Ctrl+Winkey+R to reload script
;	Enter to send message, Esc to cancel
;

;	closeOnSend true|false - If false, you will need press Escape to close
closeOnSend := true

guiPositionX := 7
guiPositionY := 220
guiWidth := 500
transparency := 230
backgroundColor := "001122"
fontSize := 14
fontColor := "00FF00"

;	Don't touch anything below unless you know what you're doing

if not A_IsAdmin {
	try Run *RunAs "%A_AhkPath%" /restart "%A_ScriptFullPath%"
	ExitApp
}

#NoEnv
#SingleInstance Force
;Menu, Tray, Icon, icons\c.ico
SetKeyDelay, 0, 0

windowClass := "ahk_class Parsec Soda"
windowControl := 
inputHeight := fontSize + (fontSize/1.4)

Gui +LastFound +AlwaysOnTop -Caption +ToolWindow
Gui, Color, %backgroundColor%, %backgroundColor%
Gui, Font, s%fontSize%
Gui, Add, Edit, vMyEdit w%guiWidth% h%inputHeight% c%fontColor% -E0x200
WinSet, Transparent, %transparency%
return

OnKey(state, iHook, VK, SC) {
	global windowControl, windowClass, closeOnSend
	keyCode := Format("vk{:X}sc{:X}", VK, SC)
	; if (keycode = "vk14sc3A") {
	; 	Exit
	; }
	if (keyCode = "vkDsc1C" or keyCode = "vkDsc11C") {
		if (!state) {
			GuiControlGet, inputMsg, , MyEdit
			GuiControl,, MyEdit, 
			if (closeOnSend) {
				iHook.stop()
				Gui, Hide
			}
			ControlSend, %windowControl%, {Text}%inputMsg%, %windowClass%
			inputMsg := 
			Sleep, 100
			ControlSend, %windowControl%, {Enter Down}, %windowClass%
			Sleep, 100
			ControlSend, %windowControl%, {Enter Up}, %windowClass%
		}
	}
	else {
		if (state) {
			ControlSend, Edit1, {%keyCode% Down}, hookInput
		}
		else {
			ControlSend, Edit1, {%keyCode% Up}, hookInput
		}
	}
}

OnEnd(iHook) {
	Gui, Hide
	GuiControl,, MyEdit, 
}

showChat() {
	global guiPositionX, guiPositionY
	Gui, Show, x%guiPositionX% y%guiPositionY% NoActivate, hookInput
	KeyWait, c
	KeyWait, Shift
	KeyWait, Ctrl
	ih := InputHook("L0")
	ih.KeyOpt("{All}", "NS")
	ih.KeyOpt("{CapsLock}", "-NS") ; Temp fix, breaks capture as it rapid fires
	ih.KeyOpt("{Escape}", "E")
	ih.OnKeyDown := Func("OnKey").bind(1)
	ih.OnKeyUp := Func("OnKey").bind(0)
	ih.OnEnd := Func("OnEnd")
	ih.Start()
	ih.Wait()
}

~#^r::reload

^+c::showChat()



;	Setup overlay transparency

getOverlayWindow() {
	;return WinExist("Overlay ahk_exe chrome.exe")
	return WinExist("Soda Overlay")
}

#^z::
hwnd := getOverlayWindow()
if (hwnd) {
	WinGet, Trans, TransColor, ahk_id %hwnd%
	if (Trans = "") {
		WinSet, TransColor, 000000 220, ahk_id %hwnd%
		WinSet, AlwaysOnTop, ON, ahk_id %hwnd%
	}
	else {
		WinSet, Transparent, OFF, ahk_id %hwnd%
		WinSet, AlwaysOnTop, OFF, ahk_id %hwnd%
	}
}
return
