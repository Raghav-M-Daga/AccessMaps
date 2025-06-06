# AccessMaps: School Edition 🗺️

[![Next.js](https://img.shields.io/badge/Next.js-13.0-blue.svg)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL%20JS-007cbf.svg)](https://www.mapbox.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

AccessMaps is a collaborative campus accessibility mapping platform that empowers students to create a more inclusive educational environment. Users can tag and describe accessibility features or challenges, helping everyone navigate campus safely and efficiently.

## 🌟 Features

- **Interactive Campus Map**
  - Real-time visualization of accessibility features and challenges
  - Color-coded pins for easy identification (red for issues, green for features)
  - Smooth map interactions powered by Mapbox GL JS
  - Pin upvoting system for community validation

- **Collaborative Features**
  - Add detailed accessibility descriptions
  - Quick-select common accessibility tags
  - Real-time updates using Firebase
  - Edit and delete your own pins

- **User Authentication**
  - Secure Google Authentication
  - Email/Password authentication
  - User-specific pin management
  - Profile-based content control

- **Responsive Design**
  - Mobile-friendly interface
  - Intuitive pin placement
  - Accessible UI components
  - Smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Mapbox API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/access_maps.git
cd access_maps
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
access_maps/
├── app/                    # Next.js 13 app directory
│   ├── map/               # Map page components
│   └── assets/            # Static assets
├── components/            # Reusable React components
│   ├── Map/              # Map-related components
│   ├── ReportForm/       # Accessibility reporting form
│   └── types/            # TypeScript type definitions
├── public/               # Static files
└── styles/              # Global styles
```

## 💻 Technologies Used

- **Frontend:**
  - Next.js 13 (React framework)
  - TypeScript
  - Mapbox GL JS
  - Tailwind CSS

- **Backend:**
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Analytics

- **Development Tools:**
  - ESLint
  - PostCSS
  - TypeScript compiler

## 🌟 Core Features

### Map Interaction
- Click anywhere on the map to add new accessibility pins
- Color-coded pins for different types of accessibility features/issues
- Interactive popups with detailed information

### Pin Management
- Add detailed descriptions for accessibility features or issues
- Upvote system for community validation
- Edit and delete your own pins
- Real-time updates across all users

### User Experience
- Smooth animations and transitions
- Intuitive UI/UX design
- Mobile-responsive layout
- Instant feedback on actions

### Authentication
- Secure Google sign-in
- User-specific content management
- Protected routes and actions

## 🔒 Security Features

- Firebase Authentication integration
- Protected API endpoints
- User data encryption
- Real-time database security rules
- Rate limiting on API calls

## 🚀 Future Enhancements

1. **Enhanced Accessibility Features**
   - Audio descriptions
   - Screen reader optimizations
   - High contrast mode
   - Multilingual support

2. **Community Features**
   - Comments on pins
   - User profiles
   - Achievement system
   - Issue resolution tracking

3. **Administrative Tools**
   - Moderation dashboard
   - Analytics dashboard
   - Bulk pin management
   - User management system

## 🤝 Contributing

We welcome contributions to AccessMaps! To contribute:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and submission process.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Project Link: [https://github.com/yourusername/access_maps](https://github.com/yourusername/access_maps)

## 🙏 Acknowledgments

- [Mapbox](https://www.mapbox.com/) for their excellent mapping platform
- [Firebase](https://firebase.google.com/) for backend services
- [Next.js](https://nextjs.org/) team for the amazing framework
- All contributors who help make campus accessibility better
