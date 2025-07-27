# Sarah & Michael's Wedding Website

A beautiful, responsive wedding website built with Vue.js and deployed on AWS Amplify.

## Features

- **Elegant Design**: Modern, romantic design with gradient backgrounds and glass-morphism effects
- **Wedding Details**: Complete information about the wedding including date, venue, and dress code
- **Image Gallery**: Rotating images that change every 3 seconds with interactive indicators
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **RSVP Section**: Ready for integration with RSVP functionality
- **AWS Amplify Ready**: Configured for easy deployment to AWS Amplify

## Wedding Information

- **Date**: October 31, 2025
- **Time**: 6:00 PM
- **Venue**: The Palace at Somerset
- **Address**: 333 Davidson Ave, Somerset, NJ 08873
- **Dress Code**: Semi-Formal

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [AWS CLI](https://aws.amazon.com/cli/) (for deployment)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd wedding
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## Development

### Project Structure

```
wedding/
├── src/
│   ├── App.vue              # Main wedding homepage
│   ├── main.ts              # Vue app entry point
│   └── assets/
│       └── main.css         # Global styles
├── public/
│   └── images/              # Wedding images
│       ├── wedding-1.svg    # Placeholder images
│       ├── wedding-2.svg
│       ├── wedding-3.svg
│       └── wedding-4.svg
├── amplify/                 # AWS Amplify configuration
└── package.json
```

### Customization

#### Changing Wedding Details
Edit the `weddingDetails` object in `src/App.vue`:

```javascript
const weddingDetails = {
  date: 'October 31, 2025',
  venue: 'The Palace at Somerset',
  time: '6:00 PM',
  dressCode: 'Semi-Formal'
}
```

#### Adding Real Wedding Photos
Replace the placeholder SVG images in `public/images/` with your actual wedding photos:

1. Add your photos to the `public/images/` directory
2. Update the `images` array in `src/App.vue`:

```javascript
const images = [
  '/images/your-photo-1.jpg',
  '/images/your-photo-2.jpg',
  '/images/your-photo-3.jpg',
  '/images/your-photo-4.jpg'
]
```

#### Changing Names
Update the names in the header section of `src/App.vue`:

```html
<h1 class="title">Laura & Quique</h1>
```

#### Customizing Colors
The website uses a beautiful gradient color scheme. You can customize the colors by editing the CSS variables in `src/App.vue`.

## Building for Production

```bash
npm run build
```

This will create a `dist/` folder with the production-ready files.

## Deployment to AWS Amplify

### Option 1: Using Amplify CLI

1. **Install Amplify CLI**:
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Configure Amplify**:
   ```bash
   amplify configure
   ```

3. **Initialize Amplify** (if not already done):
   ```bash
   amplify init
   ```

4. **Deploy**:
   ```bash
   amplify push
   ```

### Option 2: Using Amplify Console

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy

## Features to Add

- **RSVP Functionality**: Integrate with a backend service for RSVP management
- **Photo Gallery**: Add a dedicated photo gallery page
- **Wedding Registry**: Link to wedding registry
- **Travel Information**: Add hotel recommendations and travel details
- **Wedding Party**: Introduce the wedding party members
- **Timeline**: Add a wedding day timeline
- **Contact Information**: Add contact details for questions

## Technologies Used

- **Vue.js 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **AWS Amplify**: Full-stack development platform
- **CSS3**: Modern styling with gradients and animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and intended for personal use.

## Support

For questions or issues, please contact the development team.

---
