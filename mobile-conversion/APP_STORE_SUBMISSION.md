# App Store Submission Guide

This document outlines the steps required to submit the Sourdough Suite iOS app to the Apple App Store.

## Prerequisites

Before submitting the app, ensure you have:

1. An active Apple Developer Program membership
2. Xcode 14.0 or newer installed
3. A Mac computer running macOS 12.0 or newer
4. The final version of the app code with all features implemented and tested
5. All necessary assets including app icons, screenshots, and promotional materials

## App Store Connect Setup

1. **Create App in App Store Connect**

   - Log in to [App Store Connect](https://appstoreconnect.apple.com/)
   - Navigate to "My Apps" and click the "+" button to create a new app
   - Select "iOS" as the platform
   - Enter "Sourdough Suite" as the app name
   - Choose the primary language
   - Use "com.sourdoughsuite.app" as the bundle ID
   - Choose "SourdoughSuite" as the SKU
   - Select "Full access" for user data collection

2. **Set Up App Information**

   - **App Description**: "Sourdough Suite is the ultimate companion app for sourdough enthusiasts. Create custom recipes, manage starter health, get personalized recommendations, track baking timelines, and access professional-grade calculators. Perfect for both beginners and experienced bakers!"
   
   - **Keywords**: sourdough, bread, baking, starter, recipe, hydration, calculator, timeline, artisan, fermentation
   
   - **Support URL**: https://sourdoughsuite.com/support
   
   - **Marketing URL**: https://sourdoughsuite.com
   
   - **Privacy Policy URL**: https://sourdoughsuite.com/privacy

3. **Set Pricing and Availability**

   - Determine if the app will be free or paid
   - Select worldwide availability or specific countries
   - Set availability date (when the app should be released)

## App Assets Preparation

1. **App Icon**

   Create app icons in all required sizes using the Sourdough Suite logo. Required sizes:
   
   - 1024x1024 pixels (App Store)
   - 180x180 pixels (iPhone)
   - 167x167 pixels (iPad Pro)
   - 152x152 pixels (iPad, iPad mini)
   - 120x120 pixels (iPhone)
   - 87x87 pixels (iPhone Spotlight)
   - 80x80 pixels (iPhone Spotlight)
   - 76x76 pixels (iPad)
   - 60x60 pixels (iPhone)
   - 58x58 pixels (iPhone Settings)
   - 40x40 pixels (iPhone Spotlight)
   - 29x29 pixels (iPhone Settings)
   - 20x20 pixels (iPhone Notification)

2. **Screenshots**

   Capture screenshots for all supported device sizes:
   
   - iPhone 6.5" Display (1284 x 2778 pixels)
   - iPhone 5.5" Display (1242 x 2208 pixels)
   - iPad Pro 12.9" Display (2048 x 2732 pixels)
   - iPad Pro 11" Display (1668 x 2388 pixels)
   
   Include screenshots of:
   - Home screen
   - Recipe browsing
   - Starter management
   - Shop screen
   - Baking timeline calculator
   - Recipe details

3. **App Preview Video (Optional but Recommended)**

   Create a 15-30 second app preview video showcasing key features:
   - Starter management
   - Recipe creation
   - Timeline calculator
   - Shop features

## App Build Preparation

1. **Update Version and Build Numbers**

   In Xcode:
   - Set version number to "1.0.0"
   - Set build number to "1"

2. **Configure App Capabilities**

   In Xcode project settings under "Signing & Capabilities":
   - Enable Push Notifications
   - Enable In-App Purchases (if using Stripe for payments)
   - Configure App Groups if necessary
   - Enable Background Modes for notifications

3. **Create Production Certificates**

   - Generate a Distribution Certificate
   - Create a Production Provisioning Profile

4. **Configure Code Signing**

   - Select "Automatically manage signing" in Xcode
   - Select your Apple Developer Team

## Final Testing

1. **TestFlight Testing**

   - Create a build for TestFlight
   - Add internal testers (team members)
   - Test all app functionality
   - Test on multiple device sizes
   - Test network connectivity issues
   - Test permissions (notifications, etc.)

2. **Device Testing**

   Test on physical devices:
   - iPhone (latest model)
   - iPhone (older model)
   - iPad (if supporting iPad)

## Building for Submission

1. **Archive the App**

   - In Xcode, select "Generic iOS Device" as the build target
   - Select Product > Archive
   - Wait for the archiving process to complete

2. **Validate the Archive**

   - In the Organizer window, select the newest archive
   - Click "Validate App"
   - Resolve any validation issues

3. **Upload to App Store Connect**

   - After successful validation, click "Distribute App"
   - Select "App Store Connect"
   - Follow the prompts to upload

## App Store Submission

1. **Complete App Store Information**

   Ensure all required information is completed:
   - App information
   - Pricing
   - App Review Information (include test account credentials)
   - Version Information

2. **App Review Information**

   Provide login credentials for app review:
   - Demo account email: review@bakehousebreads.com
   - Demo account password: (use a secure password)
   - Notes for the reviewer explaining any special steps needed

3. **Content Rights**

   Declare if your app uses third-party content and confirm you have rights

4. **Age Rating**

   Complete the age rating questionnaire

5. **Submit for Review**

   - Verify all information is complete
   - Click "Submit for Review"

## Post-Submission

1. **Monitor Review Status**

   - Check App Store Connect regularly for status updates
   - Be ready to respond quickly to any reviewer questions

2. **Prepare for Release**

   - Once approved, prepare marketing materials
   - Decide if you want to manually release or automatically release

3. **Plan for Updates**

   - Begin planning for the next version based on user feedback
   - Maintain a roadmap of features for future updates

## App Store Optimization

1. **Keywords and Description**

   - Use all available keyword space
   - Write compelling descriptions highlighting unique features
   - Focus on benefits to users

2. **Ratings and Reviews**

   - Encourage users to rate and review
   - Add in-app rating prompts at appropriate moments

## Compliance Checklist

- [ ] App adheres to Apple's [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [ ] App includes a privacy policy
- [ ] App handles user data securely
- [ ] App includes appropriate age ratings
- [ ] App does not use private APIs
- [ ] All third-party libraries comply with App Store policies
- [ ] App handles all permissions properly with clear explanations