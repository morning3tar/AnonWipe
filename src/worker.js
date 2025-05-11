import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-pages'
import { handle } from 'hono/vercel'
import { html } from 'hono/html'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AnonWipe - Remove Metadata from Files</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                darkMode: 'class',
                theme: {
                    extend: {
                        colors: {
                            primary: '#3B82F6',
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <header class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">AnonWipe</h1>
                <p class="text-lg text-gray-600 dark:text-gray-400">Remove metadata from your files while maintaining quality</p>
            </header>

            <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div class="mb-6">
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Select File Type</label>
                    <select id="fileType" class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="image">Image (JPEG, PNG, etc.)</option>
                        <option value="audio">Audio (MP3, WAV, etc.)</option>
                        <option value="video">Video (MP4, MOV, etc.)</option>
                        <option value="pdf">PDF</option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Upload File</label>
                    <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <input type="file" id="fileInput" class="hidden" accept="image/*,audio/*,video/*,.pdf">
                        <div class="space-y-2">
                            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="text-gray-600 dark:text-gray-400">
                                <label for="fileInput" class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="fileInput" type="file" class="sr-only">
                                </label>
                                <p class="pl-1">or drag and drop</p>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Up to 10MB</p>
                        </div>
                    </div>
                </div>

                <div id="preview" class="mb-6 hidden">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Preview</h3>
                    <div id="previewContent" class="border rounded-lg p-4 dark:border-gray-600"></div>
                </div>

                <button id="processBtn" class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded disabled:opacity-50" disabled>
                    Remove Metadata
                </button>

                <div id="result" class="mt-6 hidden">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Result</h3>
                    <div id="resultContent" class="border rounded-lg p-4 dark:border-gray-600"></div>
                    <a id="downloadLink" class="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" style="display: none;">
                        Download Cleaned File
                    </a>
                </div>
            </div>

            <footer class="text-center mt-12 text-gray-600 dark:text-gray-400">
                <p>AnonWipe - Keep your files clean and private</p>
            </footer>
        </div>

        <script>
            // File handling and UI logic
            const fileInput = document.getElementById('fileInput');
            const fileType = document.getElementById('fileType');
            const processBtn = document.getElementById('processBtn');
            const preview = document.getElementById('preview');
            const previewContent = document.getElementById('previewContent');
            const result = document.getElementById('result');
            const resultContent = document.getElementById('resultContent');
            const downloadLink = document.getElementById('downloadLink');

            // Handle file selection
            fileInput.addEventListener('change', handleFileSelect);
            fileType.addEventListener('change', () => {
                fileInput.value = '';
                preview.classList.add('hidden');
                result.classList.add('hidden');
                processBtn.disabled = true;
            });

            // Handle file selection
            function handleFileSelect(e) {
                const file = e.target.files[0];
                if (!file) return;

                // Show preview
                preview.classList.remove('hidden');
                previewContent.innerHTML = `
                    <p class="text-gray-600 dark:text-gray-400">
                        Selected file: ${file.name}<br>
                        Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                `;

                processBtn.disabled = false;
            }

            // Handle file processing
            processBtn.addEventListener('click', async () => {
                const file = fileInput.files[0];
                if (!file) return;

                processBtn.disabled = true;
                processBtn.textContent = 'Processing...';

                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('type', fileType.value);

                    const response = await fetch('/process', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error('Processing failed');

                    const result = await response.blob();
                    
                    result.classList.remove('hidden');
                    resultContent.innerHTML = `
                        <p class="text-green-600 dark:text-green-400">
                            Metadata successfully removed!
                        </p>
                    `;


                    const url = URL.createObjectURL(result);
                    downloadLink.href = url;
                    downloadLink.download = `cleaned_${file.name}`;
                    downloadLink.style.display = 'inline-block';

                } catch (error) {
                    result.classList.remove('hidden');
                    resultContent.innerHTML = `
                        <p class="text-red-600 dark:text-red-400">
                            Error: ${error.message}
                        </p>
                    `;
                } finally {
                    processBtn.disabled = false;
                    processBtn.textContent = 'Remove Metadata';
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Process file endpoint
app.post('/process', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file')
  const type = formData.get('type')

  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  try {
    // Process the file based on type
    const processedFile = await processFile(file, type)
    return new Response(processedFile, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="cleaned_${file.name}"`
      }
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// file processing function
async function processFile(file, type) {
  // Convert file to ArrayBuffer
  const buffer = await file.arrayBuffer()
  
  // Process based on file type
  switch (type) {
    case 'image':
      return processImage(buffer)
    case 'audio':
      return processAudio(buffer)
    case 'video':
      return processVideo(buffer)
    case 'pdf':
      return processPDF(buffer)
    default:
      throw new Error('Unsupported file type')
  }
}

// image processing
async function processImage(buffer) {
  // Use browser's Image API to strip metadata
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  const img = new Image()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

// audio processing
async function processAudio(buffer) {
  // Use Web Audio API to strip metadata
  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(buffer)
  
  // create new buffer without metadata
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  )
  
  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(offlineContext.destination)
  source.start()
  
  const renderedBuffer = await offlineContext.startRendering()
  return renderedBuffer
}

// video processing
async function processVideo(buffer) {
  // Use MediaRecorder API to strip metadata
  const blob = new Blob([buffer], { type: 'video/mp4' })
  const video = document.createElement('video')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  return new Promise((resolve, reject) => {
    video.onloadeddata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(resolve, 'video/mp4', 0.95)
    }
    video.onerror = reject
    video.src = URL.createObjectURL(blob)
  })
}

// pdf processing
async function processPDF(buffer) {
  // Use PDF.js to strip metadata
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const newPdf = await pdfjsLib.PDFDocument.create()
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const newPage = await newPdf.addPage()
    await newPage.drawPage(page)
  }
  
  return await newPdf.save()
}

export default handle(app) 