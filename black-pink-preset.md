# Black/Pink DualSense Presets

Use these URLs with gamepad-viewer to get a **black DualSense with hot pink glowing buttons and joysticks**:

## 🔥 Black/Pink DualSense
```
https://gamepad.e7d.io/?type=dualsense&color=pink
```

## Black/Pink with Black Background (Streaming)
```
https://gamepad.e7d.io/?type=dualsense&color=pink&background=black
```

## Black/Pink with Transparent Background (OBS)
```
https://gamepad.e7d.io/?type=dualsense&color=pink&background=transparent
```

## Black/Pink with Auto Zoom
```
https://gamepad.e7d.io/?type=dualsense&color=pink&zoom=auto
```

## Black/Pink with Meter Triggers
```
https://gamepad.e7d.io/?type=dualsense&color=pink&triggers=meter
```

## Black/Pink Dimgrey Background
```
https://gamepad.e7d.io/?type=dualsense&color=pink&background=dimgrey
```

---

## Features

🎮 **Black Controller Base** - Clean, sleek black DualSense

💗 **Hot Pink Accents** - 
- Glowing pink buttons (Triangle, Circle, X, Square)
- Neon pink D-Pad highlights
- Illuminated pink joysticks
- Pink trigger glow effects
- Pink bumper highlights
- Glowing PlayStation button

✨ **Visual Effects** -
- Smooth glow on all interactive elements
- Enhanced brightness when pressed
- Bouncy spring animations
- Multiple layer glow for depth

---

## CSS File URL

```
https://raw.githubusercontent.com/gralezted/gamepad-viewer-golden/main/dualsense-black-pink.css
```

## How to Integrate

To add this black/pink skin to your gamepad-viewer fork:

1. Copy `dualsense-black-pink.css` to `templates/dualsense/`
2. Update `templates/dualsense/template.css` and add:
   ```css
   @import url('dualsense-black-pink.css');
   ```
3. Modify `js/gamepad.js` DualSense colors array:
   ```javascript
   dualsense: {
       id: /0ce6/,
       name: "DualSense",
       colors: ["white", "black", "pink"],
       triggers: true,
   },
   ```
4. Deploy and enjoy the vibes! 💗
