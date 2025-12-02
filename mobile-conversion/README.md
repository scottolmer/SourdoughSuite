# Bakehouse Breads - Mobile App

This is the React Native mobile app version of the Bakehouse Breads sourdough baking platform.

## Features

- **Recipe Management**: Browse, save, and organize bread recipes
- **Starter Care**: Track and maintain sourdough starters with reminders
- **Baker's Tools**: Calculate hydration, timelines, and more
- **Shopping**: Browse and purchase specialty starters
- **Account Management**: Track progress and save favorites

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- Watchman (`brew install watchman` on macOS)
- Xcode (for iOS development)
- CocoaPods (`sudo gem install cocoapods`)
- Ruby (comes with macOS, update with `brew install ruby`)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-organization/bakehouse-breads-mobile.git
cd bakehouse-breads-mobile
```

2. Install dependencies
```bash
npm install
```

3. Install iOS dependencies
```bash
cd ios && pod install && cd ..
```

4. Setup environment variables by creating a `.env` file in the project root:
```
API_URL=https://bakehouse-breads.replit.app
STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Running the app

#### iOS Simulator
```bash
npm run ios
```

#### iOS Device
1. Open the `ios/BakehouseBreads.xcworkspace` file in Xcode
2. Select your device in the top dropdown
3. Click the Play button to build and run

## Architecture

The app follows a modern React Native architecture with:

- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Query** for data fetching
- **Axios** for API requests
- **React Native Push Notification** for reminders
- **Stripe React Native** for payments

### Key Features Implementation

#### Sourdough Starter Timer

The starter timer provides a convenient way to track feeding schedules:

- Customizable time presets (8h, 12h, 24h)
- Push notifications for feeding reminders
- Background timing even when the app is closed
- Feeding history tracking

#### Baking Timeline Calculator

The timeline calculator helps bakers plan their baking schedule:

- Input desired bake time to plan backwards
- Adjustable parameters for bulk fermentation, proofing
- Cold proofing option
- Automatic notifications for each step

#### Hydration Calculator

The hydration calculator helps bakers understand and adjust their recipes:

- Calculate hydration percentage from ingredients
- Account for starter hydration
- Visually indicates hydration level (stiff, medium, high, very high)
- Provides texture analysis based on hydration

## Deployment

### App Store Submission

See [APP_STORE_SUBMISSION.md](./APP_STORE_SUBMISSION.md) for detailed instructions on preparing the app for App Store submission.

## License

This project is proprietary and confidential.