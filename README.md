# 🎮 Gamepad Viewer - Black/Pink Edition

A custom fork of [gamepad-viewer](https://github.com/e7d/gamepad-viewer) with **black DualSense controller featuring hot pink glowing buttons, joysticks, and highlights**.

## Features

🖤 **Black DualSense Base**
- Sleek, clean black controller background
- Professional streaming appearance

💗 **Hot Pink Glowing Accents**
- Neon pink button glows (Triangle, Circle, X, Square)
- Illuminated pink D-Pad
- Glowing pink joysticks with scale effects
- Bright pink trigger highlights
- Pink bumper glow on press
- Vibrant PlayStation button highlight

✨ **Premium Visual Effects**
- Multi-layer drop-shadow glow effects
- Smooth animations and transitions
- Enhanced glow intensity on button press
- Bouncy spring animation curves
- Perfect for streaming content

## Quick Links

### Black/Pink Preset URLs

**Basic Black/Pink:**
```
https://gamepad.e7d.io/?type=dualsense&color=pink
```

**For OBS Streaming (transparent background):**
```
https://gamepad.e7d.io/?type=dualsense&color=pink&background=transparent
```

**Black background version:**
```
https://gamepad.e7d.io/?type=dualsense&color=pink&background=black
```

**With meter triggers:**
```
https://gamepad.e7d.io/?type=dualsense&color=pink&triggers=meter
```

## CSS File

The black/pink skin CSS:
```
https://raw.githubusercontent.com/gralezted/gamepad-viewer-golden/main/dualsense-black-pink.css
```

## Usage

### For Streamers (OBS)

1. Connect your DualSense controller
2. Copy one of the preset URLs above
3. Add as Browser Source in OBS
4. Adjust size and position as needed

### For Developers

Integrate into your gamepad-viewer fork:

1. Add `dualsense-black-pink.css` to `templates/dualsense/`
2. Import in `template.css`
3. Add "pink" to DualSense colors in `js/gamepad.js`

## Colors Available

- `?color=white` - Standard white
- `?color=black` - Standard black  
- `?color=pink` - **NEW** Black controller with hot pink accents

## Based On

Built on [gamepad-viewer](https://github.com/e7d/gamepad-viewer) by [e7d](https://github.com/e7d).

## License

MIT License
