# GeoProof Camera 📸

**GeoProof Camera** is a professional Android camera application designed to capture images with verified, dynamic location metadata, high-resolution satellite map tiles, local weather, and customizable ticking date-time stamps.

This repository contains both the native Android app source code and its landing page.

---

## 📂 Repository Structure

- **`/app`**: Native Android app module built in Kotlin and CameraX.
- **`/website`**: Static landing page website showcasing the app features and including an interactive Watermark Simulator.

---

## ✨ Features

### Android App
- 📍 **Smart GPS Geotagging**: Stamps latitude, longitude, altitude, and accuracy metrics.
- 🗺️ **Satellite Map Tile**: Google Maps satellite tile overlays centered on capture coordinates.
- 🏢 **Permanent Branding**: Built-in permanent company logo overlay (`ic_company_logo`).
- 🌤️ **Live Weather Stamps**: Queries weather conditions dynamically.
- 🕒 **Ticking Time Stamp**: Live clock updates showing accurate time and date.
- 📸 **Corner Watermark Card**: A modern, translucent rounded card sitting in the bottom-right corner of captured photos.
- ⚙️ **Customizer Toggles**: Flexible settings to toggle coordinates, address details, weather, and map tiles.

### Landing Page Website
- **水 Watermark Simulator**: Interactive switches to customize coordinate tags, address lines, map overlays, weather stamps, and date-time formats, dynamically updating a live photo preview on the page.
- **Modern Dark Theme**: Designed using Outfit/Inter typography, animated gradients, and high-quality UI mockups.

---

## 🚀 Getting Started

### 1. Build and Run the Android App
1. Open this repository root in **Android Studio**.
2. Wait for Gradle sync to complete.
3. Open `PhotoWatermarker.kt` and configure your Google Maps API Key:
   ```kotlin
   const val MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"
   ```
4. Click **Run** or build a stable APK.

### 2. View the Landing Page Locally
Double-click `website/index.html` to open the landing page in any web browser, or serve it using your preferred local server:
```bash
npx serve website
```

### 3. Deploy to GitHub Pages
To host the landing page on GitHub Pages:
1. Go to your GitHub repository **Settings → Pages**.
2. Select **Source** as `Deploy from a branch`.
3. Set the branch to `main` (or your active branch) and the folder to `/website`.
4. Click **Save**.

---

## 📄 License
This project is open-source and free to distribute.
