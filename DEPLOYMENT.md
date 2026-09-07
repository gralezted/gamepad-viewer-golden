# Deployment Instructions

## 🚀 Quick Deploy to Vercel

### Option 1: Connect GitHub to Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select `gralezted/gamepad-viewer-golden`
5. Vercel will auto-detect it's a static site
6. Click "Deploy"
7. Your live URL will be: `https://gamepad-viewer-golden.vercel.app`

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

## ✅ After Deployment

Your black/pink DualSense controller will be available at:

```
https://gamepad-viewer-golden.vercel.app/?type=dualsense&color=pink
```

### For TikTok Streaming

**Copy this URL:**
```
https://gamepad-viewer-golden.vercel.app/?type=dualsense&color=pink&background=black
```

## 📱 Usage

1. Open the URL in your browser
2. Connect your PS5 DualSense controller via USB or Bluetooth
3. Press any button to activate
4. Record your TikTok with this overlay

### URL Parameters

- `?type=dualsense` - Use DualSense controller
- `?color=pink` - Hot pink glowing buttons
- `?background=black` - Black background for contrast
- `?background=transparent` - For OBS screen capture
- `?triggers=meter` - Show trigger meters
- `?zoom=1.5` - Zoom level

## 🔧 Customization

Edit `dualsense-black-pink.css` to customize colors, glow effects, etc.

## Support

Based on [gamepad-viewer](https://github.com/e7d/gamepad-viewer) by [e7d](https://github.com/e7d)
