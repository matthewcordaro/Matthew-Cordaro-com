---
title: "Building Easy Audio Toggle"
date: 2025/3/5
description: A journey in .NET 8 and WiX.
tag: C#, WiX, .NET
author: Matthew Cordaro
---

# Building EasyAudioToggle - A Journey in .NET 8.0 and WiX

## Introduction

[EasyAudioToggle](applications/EasyAudioToggle.msi) is a simple Windows app that lets you switch between your audio devices—like speakers or headphones—with a quick double click on its tray icon. Right-click it to tweak settings or close it. A friendly first-run message helps you get started and suggests keeping the icon handy in your system tray. Download it today, and if it makes your life easier, maybe buy me a coffee!


## Birth 

Having the pain of switching by going deep into my Windows settings every time I wanted to swap audio output between my headphones and my desktop speakers after gaming session, Discord chat, or music session, EasyAudioToggle started as a simple idea: a lightweight Windows tray app to switch between audio output devices with a double-click. As a developer, I wanted something useful, distributable, and dead simple to use. What followed was a rollercoaster of coding, debugging, and learning—here’s the story.

## The Starting Point

The project kicked off with .NET 8.0 and Windows Forms, chosen for their familiarity and robust support for system tray apps. I used the `AudioSwitcher.AudioApi.CoreAudio` library to manage audio devices, leveraging its simple API to list active devices and switch defaults. The initial setup was straightforward:

- A hidden `MainForm` managing the tray icon (`NotifyIcon`).
- A `SettingsForm` for users to pick two audio devices.
- Configuration stored in `appsettings.json` for persistence. (`appsettings.default.json` for installation)

## Key Development Milestones

### Manual UI Initialization

Using VS Code (no Visual Studio), I skipped the designer and built the UI manually in C#. The `SettingsForm` got ComboBoxes for device selection, a Save button, and a "Buy me a Coffee" link. Tedious, but with a basic GUI, not an issue.

### Instruction for Use

I wanted a tray tooltip and a first-run dialogue. For the tooltip, "Double-click to switch audio. Right click for settings." via `Text` field in `NotifyIcon` (Tray icon) did the job.  For the first-run dialogue, the `NotifyIcon.Text` 63-character limit forced a different route. Added a first-run `MessageBox` with detailed instructions, triggered by a `FirstRun` flag in `appsettings.json`.

### Installer Hell (_Cough, cough... I mean Challenges_)

Shipping meant an MSI with WiX Toolset 5.0.2—a beast to tame. Discerning between widespread WiX v3 online tutorials and limited v5 posts was brutal.

- Switched `<Product>` to `<Package>`, dropped invalid attributes like `Platform`.
- Used `ProgramFiles64Folder` for a 64-bit installation.
- Added a Start menu shortcut with an icon from the `.exe`.
- The custom `ExitDialog` became a war zone—more below.

### Build Size

The initial self-contained build (`--self-contained true`) ballooned the MSI to over **220MB**—absurd for a simple app. Ditched that for a framework-dependent build, assuming users have .NET 8 or grab it separately. New command: `dotnet publish -c Release -r win-x64 /p:PublishSingleFile=true /p:DebugType=None`. **MSI shrank to 1.4 MB!** _Anyone got a floppy disk?_

## Challenges Faced

### Nullable Warnings

.NET 8.0’s nullable types threw `CS8600` and `CS8602` warnings. Fixed with `??` and `!` operators, balancing safety and sanity.

### WiX v5 Errors

Just a never ending of swap this for that.  

- `WIX0005`: `<UI>` placement woes moved it to a `<Fragment>`.
- `WIX0400`: `<Text Value="...">` became `<Text>content</Text>`—a v5 syntax trap.
- `WIX0144`: `WixToolset.UI.wixext` refused to load until I wrestled NuGet paths.

### WiX Custom ExitDialog Hell

`WixUI_Minimal` clashed with my `ExitDialog`. Even with `<InstallUISequence><Show Dialog="ExitDialog" After="ExecuteAction" /></InstallUISequence>`, it hid. `<Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOX" Value="0" />` and `Height="150"` fixed it after hours of `msiexec /l*v` logs. **Then I ditched it—WiX GUI wasn’t worth it.**  `MessageBox` instead.  _My god. I should have gone that route from the start._ 

### Icon Woes

Embedding `icon.ico` into the `.exe` and Start menu shortcut took `.csproj` (<`ApplicationIcon`>) and WiX (`<Icon>`) tweaks. Consistency was a small victory.

### Library Compatibility

`<NoWarn>NU1701</NoWarn>` flagged `AudioSwitcher.AudioApi.CoreAudio` as old (.NET Standard 2.0). It works, but I had a little chat with Grok debating a switch to _.NET 6_ or _NAudio_.  My bad for not researching before coding. Decided to ship as-is—why fix what isn't broke?

## Takeaways

- **VS Code Power:** No Visual Studio needed—VS Code and `dotnet` CLI crushed it.
- **WiX Learning Curve:** WiX v5 is free but picky. Stick to v5 docs, don't venture out for help; nearly all blogs are v3, and brace for UI fights. Ditched the GUI for the `MessageBox`—simpler win.
-  **User Guidance:** Tray tooltip and first-run `MessageBox` made it intuitive.
-  **Size Sanity:** Framework-dependent cuts 98% of the size. Users need .NET 8, but that’s something they can mitigate easily.

## Final Product

EasyAudioToggle is a 64-bit MSI-installed app in `C:\Program Files\EasyAudioToggle`. It minimizes to the tray, switches audio with a double-click.  Right-click brings up the settings which save in `%LocalAppData%`. Custom `icon.ico` shines in the tray and Start menu. The first-run `MessageBox` guides users—no WiX GUI needed.

## What’s Next?

Maybe NAudio for .NET 8 love or a tray settings tweak. For now, it’s solid—grab it from the link at the top and buy me a coffee if it vibes!