# 📋 Visibee App Store Submission Checklist

## ✅ Pre-Submission Requirements

### 1. Apple Developer Account Setup
- [ ] Apple Developer Account ID: **DKQ47AA4T3** (Active ✅)
- [ ] App Store Connect access verified
- [ ] iOS Distribution Certificate generated
- [ ] App Store Provisioning Profile created
- [ ] Bundle ID registered: `com.visibee.app`

### 2. App Store Connect Configuration  
- [ ] Create new app in App Store Connect
- [ ] Set app name: **Visibee**
- [ ] Configure bundle identifier: `com.visibee.app`
- [ ] Set primary language: **English (U.S.)**
- [ ] Add app description and metadata
- [ ] Upload app icon (1024×1024px)

### 3. Required Assets & Media

#### App Icons (All Sizes)
- [ ] 1024×1024px - App Store icon
- [ ] 180×180px - iPhone app icon  
- [ ] 167×167px - iPad Pro app icon
- [ ] 152×152px - iPad app icon
- [ ] 120×120px - iPhone app icon
- [ ] 87×87px - iPhone settings icon
- [ ] 80×80px - iPhone/iPad spotlight icon
- [ ] 76×76px - iPad app icon
- [ ] 58×58px - iPhone/iPad settings icon
- [ ] 40×40px - iPhone/iPad spotlight icon
- [ ] 29×29px - iPhone/iPad settings icon
- [ ] 20×20px - iPhone/iPad notification icon

#### Screenshots (Required)
**iPhone Screenshots (6.7" Display):**
- [ ] Screenshot 1: Main wardrobe view with items
- [ ] Screenshot 2: Add item interface with AI analysis
- [ ] Screenshot 3: Function folder organization
- [ ] Screenshot 4: Hijab styles selection
- [ ] Screenshot 5: Face shape analysis feature  
- [ ] Screenshot 6: Grid view preview (4×5 layout)
- [ ] Screenshot 7: Search and filter functionality
- [ ] Screenshot 8: Item details and management

**iPad Screenshots (12.9" Display):**
- [ ] Screenshot 1: Tablet-optimized wardrobe grid
- [ ] Screenshot 2: Split-view item management
- [ ] Screenshot 3: Enhanced hijab styling interface
- [ ] Screenshot 4: AI analysis detailed view

### 4. App Information & Metadata

#### Basic Information
- [ ] **App Name**: Visibee
- [ ] **Subtitle**: Your Friendly E-Wardrobe  
- [ ] **Category**: Lifestyle
- [ ] **Secondary Category**: Fashion & Style
- [ ] **Content Rating**: 4+ (Ages 4 and up)

#### Descriptions
- [ ] **App Description**: Complete marketing description (see app-store-metadata.md)
- [ ] **Keywords**: wardrobe,closet,ADHD,hijab,fashion,AI,organize,clothes,style,outfit
- [ ] **What's New**: Version 1.0 launch description

#### Pricing & Availability  
- [ ] **Price**: Free
- [ ] **Availability**: All countries initially
- [ ] **Release**: Manual release after approval

### 5. Legal & Privacy Requirements

#### Required Documents
- [ ] **Privacy Policy**: Created ✅ (see privacy-policy.md)
- [ ] **Terms of Service**: To be created
- [ ] **Support URL**: https://visibee.app/support
- [ ] **Marketing URL**: https://visibee.app

#### Privacy Information
- [ ] **Privacy Policy URL**: https://visibee.app/privacy
- [ ] **App Privacy Details** configured in App Store Connect:
  - Photos: Used for wardrobe management
  - Usage Data: Anonymous analytics only
  - No data collection without user consent

### 6. Technical Configuration

#### App Configuration (app.json)
- [ ] Enhanced app.json implemented ✅
- [ ] iOS permissions properly configured:
  - NSCameraUsageDescription ✅
  - NSPhotoLibraryUsageDescription ✅  
  - NSPhotoLibraryAddUsageDescription ✅
- [ ] Bundle identifier: com.visibee.app ✅
- [ ] Version: 1.0.0 ✅
- [ ] Build number: 1 ✅

#### EAS Build Configuration
- [ ] eas.json configured ✅ (see eas-build-config.js)
- [ ] Apple Team ID set: DKQ47AA4T3 ✅
- [ ] Production build profile configured ✅
- [ ] Submit configuration ready ✅

### 7. Code Export & Build Process

#### Export from Emergent
- [ ] Use "Save to GitHub" to export complete codebase
- [ ] Verify all files exported:
  - Frontend React Native/Expo code ✅
  - Backend FastAPI code ✅
  - Database configurations ✅
  - Assets and images ✅

#### Local Build Setup
- [ ] Install Expo CLI: `npm install -g @expo/eas-cli`
- [ ] Login to Expo: `eas login`
- [ ] Configure build: `eas build:configure`
- [ ] Replace app.json with enhanced version
- [ ] Add eas.json to project root

### 8. Testing Requirements

#### Pre-Submission Testing
- [ ] Test on physical iOS device
- [ ] Verify all core features work:
  - Photo capture/selection ✅
  - AI analysis functionality ✅
  - Wardrobe management ✅
  - Function folder organization ✅
  - Hijab styling features ✅
  - Search and filtering ✅
- [ ] Test permissions requests
- [ ] Verify app performance and stability
- [ ] Check for memory leaks or crashes

#### App Store Review Preparation
- [ ] Create demo user account if needed
- [ ] Prepare review notes explaining special features
- [ ] Document hijab cultural sensitivity measures
- [ ] Test offline functionality
- [ ] Verify app follows iOS Human Interface Guidelines

### 9. Build & Submission Commands

#### Build for App Store
```bash
# Navigate to exported project directory
cd visibee-app

# Install dependencies  
npm install

# Build for iOS App Store
eas build --platform ios --profile production

# Submit to App Store (after build completes)
eas submit --platform ios --profile production
```

### 10. Post-Submission Monitoring

#### App Review Process
- [ ] Monitor App Store Connect for review status
- [ ] Respond to any reviewer feedback within 7 days
- [ ] Address any rejection reasons promptly
- [ ] Prepare for potential follow-up questions

#### Launch Preparation  
- [ ] Prepare marketing materials
- [ ] Plan social media announcements
- [ ] Set up app analytics and monitoring
- [ ] Prepare user support processes

## 📞 Important Contacts & Resources

**Apple Developer Account**: DKQ47AA4T3  
**Developer Email**: threealani@gmail.com  
**App Store Connect**: https://appstoreconnect.apple.com  
**Expo Documentation**: https://docs.expo.dev/  
**EAS Build Guide**: https://docs.expo.dev/build/introduction/  

## ⚡ Quick Action Items

**Immediate Next Steps:**
1. Export code from Emergent using "Save to GitHub"
2. Set up local development environment
3. Create App Store Connect app listing
4. Generate required app icons and screenshots
5. Build with EAS and submit for review

**Estimated Timeline:**
- Code export & setup: 1-2 days
- Asset creation: 2-3 days  
- App Store Connect configuration: 1 day
- Build & submission: 1 day
- **Apple Review Process: 1-7 days**
- **Total: 5-13 days to live app** 🚀

---

*This checklist ensures nothing is missed in your App Store submission process. Check off each item as you complete it!*