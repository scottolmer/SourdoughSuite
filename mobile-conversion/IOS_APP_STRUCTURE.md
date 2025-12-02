# Sourdough Suite iOS App Structure

This document outlines the structure and organization of the Sourdough Suite iOS application.

## Project Structure

```
mobile-conversion/
├── src/                          # Source code directory
│   ├── api/                      # API and networking code
│   │   └── apiClient.ts          # Main API client for server communication
│   ├── assets/                   # Static assets (images, fonts, etc.)
│   ├── components/               # Reusable UI components
│   │   ├── Badge.tsx             # Badge component for labels
│   │   ├── Button.tsx            # Custom button component
│   │   └── Card.tsx              # Card container component
│   ├── contexts/                 # React context providers
│   │   ├── BakerToolsContext.tsx # Context for baker tools state
│   │   ├── ShopContext.tsx       # Context for shopping cart state
│   │   └── UserContext.tsx       # Context for user authentication state
│   ├── hooks/                    # Custom React hooks
│   │   └── useTheme.ts           # Hook for theme management
│   ├── navigation/               # Navigation configuration
│   │   └── AppNavigator.tsx      # Main navigation setup
│   ├── screens/                  # Application screens
│   │   ├── HomeScreen.tsx        # Home screen
│   │   ├── RecipesScreen.tsx     # Recipes listing screen
│   │   ├── RecipeDetailScreen.tsx# Recipe detail screen
│   │   ├── StarterScreen.tsx     # Starter management screen
│   │   ├── StarterTimerScreen.tsx# Starter feeding timer screen
│   │   ├── ShopScreen.tsx        # Shop screen for purchasing starters
│   │   ├── ToolsScreen.tsx       # Baker's tools screen
│   │   └── HydrationCalculatorScreen.tsx # Hydration calculator tool
│   └── utils/                    # Utility functions
│       └── notificationService.ts # Push notification handling
├── ios/                          # iOS-specific native code
├── App.tsx                       # Main app component
├── babel.config.js               # Babel configuration
├── index.js                      # Entry point
├── package.json                  # NPM dependencies
├── tsconfig.json                 # TypeScript configuration
└── app.json                      # React Native app configuration
```

## Key Features

### Sourdough Starter Management
- Track multiple starters
- Feeding reminders and timers
- Health monitoring
- Feeding history

### Recipe Management
- Browse, filter, and search recipes
- Save favorite recipes
- Generate custom recipes based on preferences
- Step-by-step instructions

### Baker's Tools
- Hydration calculator
- Baking timeline calculator
- Dough temperature calculator
- Recipe validator

### Shopping
- Purchase specialty sourdough starters
- Shopping cart and checkout

## Navigation Structure

The app uses a combination of tab and stack navigation:

### Tab Navigation
- Home
- Recipes
- Starter
- Shop
- Tools

### Stack Navigation
Each tab has its own navigation stack:

- **Home Stack**
  - HomeScreen
  - RecipeDetailScreen
  - StarterDetailScreen
  - ProfileScreen

- **Recipe Stack**
  - RecipesScreen
  - RecipeDetailScreen
  - RecipeValidatorScreen

- **Starter Stack**
  - StarterScreen
  - StarterDetailScreen
  - StarterTimerScreen
  - AddStarterScreen

- **Shop Stack**
  - ShopScreen
  - ProductDetailScreen
  - CartScreen
  - CheckoutScreen

- **Tools Stack**
  - ToolsScreen
  - TimelineCalculatorScreen
  - HydrationCalculatorScreen
  - DoughTempCalculatorScreen
  - RecipeValidatorScreen

## State Management

The app uses React Context for state management:

- **UserContext**: Manages user authentication, profile data, and preferences
- **ShopContext**: Manages shopping cart state and checkout process
- **BakerToolsContext**: Manages baker's tools data and calculations

## Data Fetching

- Uses React Query for data fetching, caching, and state management
- API calls are centralized in the apiClient.ts file

## Notifications

- Push notifications for starter feeding reminders
- Baking timeline notifications
- Local notifications for timers

## Styling

- Uses React Native's StyleSheet for styling
- Consistent color palette and typography throughout the app

## Next Steps

1. Set up the iOS project with CocoaPods
2. Complete the remaining screen implementations
3. Implement the native notification system
4. Test on various iOS device sizes
5. Prepare assets for App Store submission