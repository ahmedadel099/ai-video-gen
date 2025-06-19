# AI Video Generator 🎬✨

A powerful web application that generates monetizable short-form videos using AI. Create faceless, vertical videos with AI voiceovers, automatic subtitles, and royalty-free stock footage - perfect for TikTok, Reels, and YouTube Shorts.

![AI Video Generator Demo](https://img.shields.io/badge/Status-Active-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009485)

## 🚀 Features

### Core Functionality
- **AI-Powered Voiceovers**: Generate high-quality speech using Microsoft Edge TTS with multiple voice options
- **Automatic Subtitle Generation**: Use OpenAI Whisper for accurate transcription and styled subtitle overlay
- **Stock Video Integration**: Search and use royalty-free videos from Pexels API
- **Custom Video Upload**: Upload your own background videos
- **Smart Video Composition**: Automatically crop, resize, and format videos to 9:16 aspect ratio (1080x1920)
- **Real-time Progress Tracking**: Live updates during video generation process
- **Instant Preview & Download**: Preview generated videos and download as MP4

### Technical Features
- **Fast Processing**: Average video generation in under 60 seconds
- **Multiple Video Concatenation**: Automatically combines multiple stock videos to match audio duration
- **Professional Styling**: Modern, responsive UI built with Tailwind CSS
- **Error Handling**: Robust error handling with user-friendly messages
- **CORS Support**: Ready for deployment with proper cross-origin configuration

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **Edge-TTS** - Microsoft's text-to-speech engine (free)
- **OpenAI Whisper** - Advanced speech recognition for subtitle generation
- **MoviePy** - Video processing and composition
- **FFmpeg** - Video encoding and processing
- **HTTPX** - Modern HTTP client for Python
- **Python-multipart** - File upload handling

### Frontend
- **Next.js 15.3.3** - React framework with server-side rendering
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **ESLint** - Code linting and formatting

### APIs & Services
- **Pexels API** - Royalty-free stock video search
- **Server-Sent Events (SSE)** - Real-time progress updates

## 📋 Prerequisites

Before installation, ensure you have:

- **Python 3.8+** installed
- **Node.js 18+** and npm/yarn
- **FFmpeg** installed on your system
  - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - **macOS**: `brew install ffmpeg`
  - **Linux**: `sudo apt install ffmpeg` (Ubuntu/Debian) or `sudo yum install ffmpeg` (CentOS/RHEL)
- **Git** for cloning the repository

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai_video_gen.git
cd ai_video_gen
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

**Optional**: Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

Create a `.env` file in the backend directory (optional - for Pexels API):
```bash
cd ../backend
touch .env
```

Add your Pexels API key (get one free at [pexels.com/api](https://www.pexels.com/api/)):
```env
PEXELS_API_KEY=your_api_key_here
```

**Note**: The application works without a Pexels API key, but you'll need to upload your own videos.

## 🏃‍♂️ Running the Application

### Start the Backend Server
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📱 Usage

1. **Open the Application**: Navigate to `http://localhost:3000`

2. **Enter Your Script**: Write or paste your video script in the text area

3. **Select Voice**: Choose from available AI voices (Jenny, Sonia, Natasha, Clara, Neerja)

4. **Choose Background Video**:
   - **Stock Video**: Enter search terms for Pexels (e.g., "nature", "city", "ocean")
   - **Upload**: Select your own MP4 file

5. **Generate**: Click "Generate Video" and watch the real-time progress

6. **Download**: Once complete, preview and download your video

## 🎯 Project Structure

```
ai_video_gen/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main application entry point
│   ├── requirements.txt    # Python dependencies
│   ├── services/           # Core business logic
│   │   ├── voiceover.py    # Edge-TTS integration
│   │   ├── subtitles.py    # Whisper transcription
│   │   ├── video_composition.py # Video processing
│   │   └── pexels.py       # Stock video search
│   └── outputs/            # Generated video files
├── frontend/               # Next.js React frontend
│   ├── src/app/
│   │   ├── page.tsx        # Main application UI
│   │   └── layout.tsx      # Root layout
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS config
└── README.md              # This file
```

## 🚀 Deployment

### Backend Deployment
The backend can be deployed on:
- **Render** (recommended for beginners)
- **Railway**
- **Heroku**
- **DigitalOcean**
- **AWS/Google Cloud**

### Frontend Deployment
The frontend is optimized for deployment on:
- **Vercel** (recommended - built by Next.js creators)
- **Netlify**
- **GitHub Pages**

### Environment Variables for Production
- `PEXELS_API_KEY`: Your Pexels API key
- `FRONTEND_URL`: Your frontend domain (for CORS)

## 🔧 Configuration

### Voice Options
The application supports multiple AI voices:
- `en-US-JennyNeural` - Natural American female voice
- `en-GB-SoniaNeural` - British female voice
- `en-AU-NatashaNeural` - Australian female voice
- `en-CA-ClaraNeural` - Canadian female voice
- `en-IN-NeerjaNeural` - Indian female voice

### Video Settings
- **Output Format**: MP4
- **Aspect Ratio**: 9:16 (vertical)
- **Resolution**: 1080x1920
- **Audio**: 44.1kHz, stereo
- **Subtitle Style**: White text with black outline

## 🐛 Troubleshooting

### Common Issues

**"FFmpeg not found"**
- Ensure FFmpeg is installed and in your system PATH
- Test with: `ffmpeg -version`

**"No videos found for that query"**
- Check your internet connection
- Try different search terms
- Verify Pexels API key (if using)

**"Server error during generation"**
- Check backend logs for detailed error messages
- Ensure all dependencies are installed
- Verify Python version compatibility

**Frontend can't connect to backend**
- Ensure backend is running on port 8000
- Check CORS configuration in `main.py`
- Verify frontend is making requests to correct URL

### Performance Tips
- Use shorter scripts for faster generation
- Ensure adequate disk space for temporary files
- Close other resource-intensive applications during processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft Edge TTS** for free, high-quality text-to-speech
- **OpenAI Whisper** for accurate speech recognition
- **Pexels** for royalty-free stock videos
- **MoviePy** for powerful video processing capabilities
- **FastAPI** and **Next.js** communities for excellent documentation

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/ai_video_gen/issues)
3. Create a new issue with detailed information about your problem

---

⭐ **Star this repository if you found it helpful!**

Made with ❤️ for content creators worldwide. 