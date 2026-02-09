# Moyo SOS App

A React Native mobile application built with Expo, Convex, and Clerk.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended, v18+) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Expo Go** app on your iOS or Android device (for testing on physical devices).

### Platform Specific Requirements

#### 🍎 macOS
- **Watchman** (Recommended for better file watching performance):
  ```bash
  brew install watchman
  ```
- **Xcode** (Optional, for iOS Simulator): Install via Mac App Store.
- **Android Studio** (Optional, for Android Emulator): [Download](https://developer.android.com/studio).

#### 🪟 Windows
- **PowerShell Execution Policy**: You may need to enable script execution. Run PowerShell as Administrator:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- **Android Studio** (Optional, for Android Emulator): [Download](https://developer.android.com/studio).
- **WSL2** (Optional but recommended for a better development experience).

#### 🐧 Linux
- **Android Studio** (Optional, for Android Emulator): [Download](https://developer.android.com/studio).
- **Watchman** (Optional but recommended): Follow the [installation guide](https://facebook.github.io/watchman/docs/install.html).

---

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sos-core-ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory by copying the example:
   ```bash
   cp .env.example .env
   # On Windows Command Prompt: copy .env.example .env
   ```
   
   Update `.env` with your actual keys (Ask the project lead for these if you don't have them):
   ```env
   API_URL=https://sos.macroit.org/api
   EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
   ```
   > **Note:** The `EXPO_PUBLIC_` prefix is required for variables to be available in the Expo app.

4. **Setup Backend (Convex):**
   This project uses [Convex](https://www.convex.dev/) for the backend. You need to link to your Convex project and generate the API client.
   ```bash
   npx convex dev
   ```
   This command will:
   - Log you in to Convex.
   - Configure your project.
   - Run the Convex development server.
   
   *Keep this command running in a separate terminal window while developing.*

---

## 🏃‍♂️ Running the App

1. **Start the development server:**
   ```bash
   npx expo start
   ```
   
2. **Open the app:**
   - **Press `a`** to open in Android Emulator.
   - **Press `i`** to open in iOS Simulator (macOS only).
   - **Scan the QR code** with your phone's camera (iOS) or the Expo Go app (Android) to run on a physical device.

   > **Troubleshooting:**
   > - If you have trouble connecting, try `npx expo start --tunnel`.
   > - Make sure your phone and computer are on the same Wi-Fi network.

---

## 🛠 Project Structure

- **/app**: (If using Expo Router, though this project appears to follow a different structure based on files).
- **/components**: Reusable UI components.
- **/convex**: Backend functions and database schema.
- **/screens**: Application screens.
- **/assets**: Images, fonts, and other static assets.
- **/services**: API services and integrations.
- **/hooks**: Custom React hooks.

---

## 🏗 Builds (Android & iOS)

For detailed instructions on building APKs/IPAs for production or testing, please refer to [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md).

Quick reference:
- **Android Preview**: `eas build --platform android --profile preview`
- **iOS Preview**: `eas build --platform ios --profile preview` (Requires Apple Developer Account)

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
