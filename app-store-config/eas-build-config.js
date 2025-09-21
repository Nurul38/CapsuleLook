// eas.json - Expo Application Services Configuration
// This file should be placed in your project root as eas.json

{
  "cli": {
    "version": ">= 7.8.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium",
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "bundleIdentifier": "com.visibee.app",
        "buildNumber": "1",
        "config": {
          "usesNonExemptEncryption": false
        }
      },
      "android": {
        "resourceClass": "m-medium",
        "buildType": "aab",
        "applicationId": "com.visibee.app",
        "versionCode": 1
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "threealani@gmail.com",
        "ascAppId": "[TO_BE_FILLED_AFTER_APP_STORE_CONNECT_SETUP]",
        "appleTeamId": "DKQ47AA4T3"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}

// Instructions for use:
// 1. Save this as eas.json in your project root
// 2. Replace [TO_BE_FILLED_AFTER_APP_STORE_CONNECT_SETUP] with actual App Store Connect app ID
// 3. Ensure your Apple Developer Account (DKQ47AA4T3) has necessary certificates
// 4. Run: eas build --platform ios --profile production
// 5. Run: eas submit --platform ios --profile production