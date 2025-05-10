import os
from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import magic
import mutagen
from mutagen.mp3 import MP3
from mutagen.wave import WAVE
from mutagen.oggvorbis import OggVorbis
from mutagen.flac import FLAC
from PyPDF2 import PdfReader, PdfWriter
import tempfile
import shutil
import json

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()

ALLOWED_EXTENSIONS = {
    'image': {'jpg', 'jpeg', 'png', 'gif', 'tiff'},
    'audio': {'mp3', 'wav', 'ogg', 'aiff', 'flac'},
    'video': {'mp4', 'avi', 'flv', 'mov', 'webm'},
    'pdf': {'pdf'}
}

STATS_FILE = 'stats.json'

def allowed_file(filename, file_type):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS[file_type]

def remove_image_metadata(file_path):
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cleaned_' + os.path.basename(file_path))
    image = Image.open(file_path)
    data = list(image.getdata())
    image_without_exif = Image.new(image.mode, image.size)
    image_without_exif.putdata(data)
    image_without_exif.save(output_path, quality=95)
    return output_path

def remove_audio_metadata(file_path):
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cleaned_' + os.path.basename(file_path))
    file_ext = file_path.lower().split('.')[-1]
    
    if file_ext == 'mp3':
        audio = MP3(file_path)
    elif file_ext == 'wav':
        audio = WAVE(file_path)
    elif file_ext == 'ogg':
        audio = OggVorbis(file_path)
    elif file_ext == 'flac':
        audio = FLAC(file_path)
    else:
        return file_path

    audio.delete()
    audio.save()
    shutil.copy2(file_path, output_path)
    return output_path

def remove_pdf_metadata(file_path):
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cleaned_' + os.path.basename(file_path))
    reader = PdfReader(file_path)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    with open(output_path, 'wb') as output_file:
        writer.write(output_file)

    return output_path

def load_stats():
    if not os.path.exists(STATS_FILE):
        return {'files_processed': 0, 'total_size_bytes': 0}
    with open(STATS_FILE, 'r') as f:
        return json.load(f)

def save_stats(stats):
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            mime = magic.Magic(mime=True)
            mime_type = mime.from_file(file_path)
            output_path = None
            # Image
            if mime_type.startswith('image/'):
                output_path = remove_image_metadata(file_path)
            # Audio
            elif mime_type.startswith('audio/'):
                output_path = remove_audio_metadata(file_path)
            # PDF
            elif mime_type == 'application/pdf':
                output_path = remove_pdf_metadata(file_path)
            # Video (not implemented yet)
            elif mime_type.startswith('video/'):
                return jsonify({'error': 'Video metadata removal not implemented yet.'}), 400
            else:
                return jsonify({'error': f'Unsupported file type: {mime_type}'}), 400
            
            stats = load_stats()
            stats['files_processed'] += 1
            stats['total_size_bytes'] += os.path.getsize(file_path)
            save_stats(stats)
            
            return send_file(output_path, as_attachment=True, download_name='cleaned_' + filename)
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
            if 'output_path' in locals() and output_path and os.path.exists(output_path):
                os.remove(output_path)
    
    return jsonify({'error': 'Invalid file'}), 400

@app.route('/stats')
def get_stats():
    stats = load_stats()
    return jsonify(stats)

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True) 