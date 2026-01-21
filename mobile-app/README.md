# 📱 Ro-Tech Portal - Mobile App

Een React Native (Expo) app voor het Ro-Tech klantenportaal. Klanten kunnen hun projecten, abonnementen en support tickets beheren.

## ✨ Features

- **Login/Registratie** - Veilige authenticatie met JWT tokens
- **Dashboard** - Overzicht van producten, abonnement en tickets
- **Producten** - Bekijk je websites, webshops en apps
- **Support** - Maak tickets aan en volg de status
- **Instellingen** - Profiel, contact opties, uitloggen

## 🛠️ Tech Stack

- **Expo SDK 54** - React Native framework
- **TypeScript** - Type-safe development
- **React Navigation 7** - Navigatie (tabs + stacks)
- **Expo Secure Store** - Veilige token opslag
- **React Native Safe Area Context** - Safe area handling

## 📋 Vereisten

- Node.js 18+
- npm of yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) - voor APK builds
- Expo account (gratis) - voor cloud builds

## 🚀 Installatie

```bash
# Navigeer naar de mobile-app folder
cd mobile-app

# Installeer dependencies
npm install

# Start development server
npm start
```

## 📱 Ontwikkeling

### Lokaal testen

```bash
# Start Expo development server
npm start

# Of direct op Android
npm run android

# Of in web browser (voor UI testing)
npm run web
```

### Op je telefoon testen

1. Installeer de **Expo Go** app op je telefoon (Play Store / App Store)
2. Scan de QR code die verschijnt na `npm start`
3. De app opent in Expo Go

## 🏗️ APK Bouwen (voor installatie via WhatsApp)

### Optie 1: EAS Cloud Build (Aanbevolen)

```bash
# Login bij Expo
npx eas login

# Configureer project (eerste keer)
npx eas build:configure

# Bouw preview APK (snelste optie)
npx eas build --platform android --profile preview

# Of productie APK
npx eas build --platform android --profile production
```

Na de build (5-15 minuten) krijg je een download link voor de APK.

### Optie 2: Lokale Build (Android Studio vereist)

```bash
# Genereer native Android project
npx expo prebuild --platform android

# Bouw APK
cd android
./gradlew assembleRelease

# APK locatie: android/app/build/outputs/apk/release/app-release.apk
```

## 📤 APK Delen via WhatsApp

1. Bouw de APK (zie hierboven)
2. Download de APK naar je computer
3. Upload naar een file hosting service:
   - **Google Drive** - Maak een deelbare link
   - **Dropbox** - Maak een deelbare link
   - **WeTransfer** - Upload en deel link
4. Stuur de link via WhatsApp naar jezelf of klanten

### Installatie op Android

1. Open de download link op je Android telefoon
2. Download de APK
3. Tik op de gedownloade APK
4. Als gevraagd: "Installeren van onbekende bronnen toestaan"
5. Tik op "Installeren"
6. Open de app!

## ⚙️ Configuratie

### API URL aanpassen

Bewerk `src/constants/config.ts`:

```typescript
// Development (lokaal netwerk)
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:3000'  // Vervang met je lokale IP
  : 'https://ro-techdevelopment.com';
```

**Je lokale IP vinden:**
- Windows: `ipconfig` → IPv4 Address
- Mac/Linux: `ifconfig` of `ip addr`

### Environment Variables (Website)

Voeg toe aan je website `.env.local`:

```env
JWT_SECRET=jouw-super-geheime-jwt-key-minimaal-32-tekens
```

## 📁 Project Structuur

```
mobile-app/
├── App.tsx                 # Entry point
├── app.json               # Expo configuratie
├── eas.json               # EAS Build configuratie
├── src/
│   ├── components/        # Herbruikbare UI componenten
│   │   └── ui/           # Button, Input, Card, Badge
│   ├── constants/         # Configuratie & thema
│   │   ├── config.ts     # API URLs, storage keys
│   │   └── theme.ts      # Kleuren, spacing, typography
│   ├── context/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/        # React Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/          # Schermen
│   │   ├── auth/         # Login, Register
│   │   └── main/         # Dashboard, Products, Support, Settings
│   ├── services/         # API & Auth services
│   │   ├── api.ts
│   │   └── auth.ts
│   └── types/            # TypeScript types
│       └── index.ts
└── assets/               # App icons & splash screen
```

## 🎨 Design

De app volgt de Ro-Tech huisstijl:

| Element | Kleur |
|---------|-------|
| Primary | `#4F46E5` (Indigo) |
| Secondary | `#7C3AED` (Violet) |
| Accent | `#10B981` (Emerald) |
| Background | `#F8FAFC` (Slate 50) |
| Text | `#0F172A` (Slate 900) |

## 🔐 Authenticatie

De app gebruikt JWT tokens voor authenticatie:

1. Gebruiker logt in via `/api/auth/mobile/login`
2. Server retourneert JWT token (30 dagen geldig)
3. Token wordt opgeslagen in Expo Secure Store
4. Token wordt meegestuurd bij alle API requests
5. Sessie validatie via `/api/auth/mobile/session`

## 🐛 Troubleshooting

### "Network request failed"

- Check of je API server draait
- Verifieer de API_BASE_URL in config.ts
- Zorg dat je telefoon op hetzelfde WiFi netwerk zit

### "Token ongeldig of verlopen"

- Log uit en log opnieuw in
- Check of JWT_SECRET hetzelfde is op server

### APK installeert niet

- Verwijder oude versie eerst
- Zorg dat "Onbekende bronnen" is toegestaan
- Check of er genoeg opslagruimte is

## 📞 Support

- **Website:** https://ro-techdevelopment.com
- **Email:** support@ro-techdevelopment.com
- **Telefoon:** +31 6 57 23 55 74

---

Built with ❤️ by Ro-Tech Development | © 2026
