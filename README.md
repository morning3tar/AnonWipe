# AnonWipe

AnonWipe is a modern web application that helps you remove metadata from various file types while maintaining file quality. Protect your privacy by removing sensitive information from your files.

<img width="1580" alt="screen-app" src="https://github.com/user-attachments/assets/a394c069-5536-4441-a9d3-42dc8692e4ea" />


## Features

- Remove EXIF and metadata from images (JPEG, PNG, GIF, TIFF)
- Remove metadata from audio files (MP3, WAV, OGG, AIFF, FLAC)
- Remove metadata from PDF documents
- Beautiful, responsive UI with full dark mode support
- About and Privacy Policy pages
- Stats for files processed and total size

## File Size Limit

- The default maximum file size is **16MB** (configurable in `app.py`).
- This is suitable for most images, audio, and PDFs, and works well with free hosting resources.

## Why Not Static Hosting?

AnonWipe requires a backend (Python/Flask) to process and clean files. Pure static hosting (like GitHub Pages or Netlify static) cannot run Python or process files. For browser-only metadata removal, see the FAQ below.

## Deployment

You can deploy AnonWipe for free using these platforms:

### Render.com
- Easiest for Flask apps, free tier available
- [Render Flask Quickstart](https://render.com/docs/deploy-flask)

### Fly.io
- Free tier, runs Dockerized Flask apps

### Railway.app
- Free tier, easy GitHub integration

> **Note:** Always set `debug=False` in production. Free hosts may sleep your app after inactivity and have storage/RAM limits.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AnonWipe.git
cd AnonWipe
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Usage

1. Upload your file (image, audio, or PDF)
2. Click "Remove Metadata"
3. Download your cleaned file

## Security

- All processing is done locally on your server
- Files are automatically deleted after processing
- No data is stored or shared

## FAQ

**Q: Can I deploy this as a static site?**
A: No. Metadata removal requires Python backend processing. Pure static hosting cannot process files. For browser-only EXIF removal, see [exif-js](https://github.com/exif-js/exif-js) (images only, limited).

**Q: How do I increase the file size limit?**
A: Edit `app.config['MAX_CONTENT_LENGTH']` in `app.py`.

## License

MIT License 