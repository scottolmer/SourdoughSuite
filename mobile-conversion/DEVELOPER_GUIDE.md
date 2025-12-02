# Bakehouse Breads iOS Developer Guide

This guide provides instructions for developers working on the Bakehouse Breads iOS application.

## Getting Started

### Prerequisites

1. **Node.js** (v18 or newer)
   ```bash
   # Check your version
   node -v
   ```

2. **Watchman** (for file system monitoring)
   ```bash
   # Install via Homebrew
   brew install watchman
   ```

3. **Xcode** (14.0 or newer)
   - Download from the Mac App Store
   - Install the iOS SDK
   - Install Command Line Tools: `xcode-select --install`

4. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

5. **iOS Simulator or Device**
   - Set up through Xcode

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bakehouse-breads-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install CocoaPods dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in the required API keys and configuration

### Running the App

1. **Start Metro Bundler**
   ```bash
   npm start
   ```

2. **Run on iOS Simulator**
   ```bash
   npm run ios
   ```

3. **Run on iOS Device**
   - Connect your device
   - Open `ios/BakehouseBreads.xcworkspace` in Xcode
   - Select your device as the target
   - Press the Play button

## Development Workflow

### Project Structure

Review the detailed structure in [IOS_APP_STRUCTURE.md](./IOS_APP_STRUCTURE.md).

### Code Style and Conventions

- Use TypeScript for type safety
- Follow React Native's performance best practices
- Use functional components with hooks
- Maintain consistent naming conventions

### State Management

- Use React Context for global state management
- Use local state for component-level state
- Use React Query for server state

### Styling Guidelines

- Use StyleSheet for styling components
- Follow the design system as specified in `src/utils/theme.ts`
- Maintain consistency with the existing screens

### Adding New Screens

1. Create the screen component in `src/screens/`
2. Add the screen to the appropriate navigation stack in `src/navigation/AppNavigator.tsx`
3. Update any relevant context providers if needed

### Working with the API

- All API calls should go through the `apiClient.ts` service
- Use React Query for data fetching and caching
- Handle loading states and errors consistently

### Testing

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Testing on Real Devices**
   - Connect your iOS device
   - Trust the developer certificate
   - Run `npm run ios --device`

### Debugging

1. **React Native Debugger**
   - Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
   - Run it before starting the app
   - Press `Cmd + D` in the simulator to open the developer menu

2. **Console Logs**
   - View logs in the terminal running Metro
   - Use the React Native Debugger console

3. **Network Requests**
   - Monitor in React Native Debugger Network tab
   - Add logging interceptors in `apiClient.ts`

## Release Process

### Building for TestFlight

1. Update version in `package.json` and `ios/BakehouseBreads/Info.plist`
2. Generate release build:
   ```bash
   cd ios
   xcodebuild -workspace BakehouseBreads.xcworkspace -scheme BakehouseBreads -configuration Release -sdk iphoneos -derivedDataPath build
   ```

3. Archive the build in Xcode
   - Open Xcode
   - Select "Product" > "Archive"
   - Follow the upload steps for TestFlight

### App Store Submission

See [APP_STORE_SUBMISSION.md](./APP_STORE_SUBMISSION.md) for detailed instructions.

## Troubleshooting

### Common Issues

1. **CocoaPods installation problems**
   ```bash
   sudo gem install cocoapods -n /usr/local/bin
   ```

2. **Metro bundler port conflicts**
   ```bash
   npx kill-port 8081
   npm start -- --reset-cache
   ```

3. **iOS build errors**
   - Make sure Xcode command line tools are installed
   - Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
   - Clean and rebuild: Xcode -> Product -> Clean Build Folder

4. **Missing API keys**
   - Check that `.env` file has all required keys
   - Verify that keys are correctly loaded with `react-native-config`

## Architecture Decisions

### React Native

We chose React Native to leverage our existing React codebase and provide a native experience while sharing code between platforms.

### TypeScript

TypeScript provides compile-time type checking, reducing runtime errors and improving developer productivity.

### React Query

React Query simplifies data fetching, caching, and state management for server state.

### Context API

React Context API provides a clean way to manage global application state without additional libraries.

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Submit a pull request
4. Ensure tests pass and no linting errors

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)