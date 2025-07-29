# Quique & Laura's Wedding Website

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
