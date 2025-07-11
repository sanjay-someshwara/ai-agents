# Context Aware Chat with Ollama

A modern, context-aware chatbot interface that integrates with Ollama for local AI model interactions. Upload documents and have conversations based on your specific content with streaming responses and chat memory.

## Features

- 🤖 **Local AI Models**: Integrates with Ollama for privacy-focused AI conversations
- 📄 **Context Upload**: Upload text files, PDFs, Markdown, or CSV files to provide context
- 💬 **Chat Memory**: Maintains conversation history across messages
- 🔄 **Streaming Responses**: Real-time streaming of AI responses
- ⚙️ **Model Management**: Pull and manage different AI models
- 🎨 **Modern UI**: Clean, responsive interface with dark theme
- 🔒 **Context-Aware**: AI responds only based on uploaded context and basic greetings

## Prerequisites

Before running this project, make sure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Python** (v3.8 or higher)
   - Download from [python.org](https://www.python.org/)

3. **Ollama** (for running local AI models)
   - Download and install from [ollama.ai](https://ollama.ai/)
   - After installation, start Ollama service

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd context-aware-chat
```

### 2. Set Up the Backend (FastAPI)

1. Navigate to the backend directory (if separate) or stay in root:
```bash
# If you have a separate backend folder
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

4. Install Python dependencies:
```bash
pip install fastapi==0.104.1 uvicorn==0.24.0 httpx==0.25.2 pydantic==2.5.0 python-multipart==0.0.6 PyPDF2==3.0.1
```

Or if you have a requirements.txt file:
```bash
pip install -r requirements.txt
```

### 3. Set Up the Frontend (React)

1. Navigate to the frontend directory (if separate) or stay in root:
```bash
# If you have a separate frontend folder
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

If you don't have a package.json, create one and install these dependencies:
```bash
npm init -y
npm install react react-dom typescript @types/react @types/react-dom @types/node
npm install -D @vitejs/plugin-react vite
npm install lucide-react
```

### 4. Set Up Ollama Models

1. Make sure Ollama is running:
```bash
ollama serve
```

2. Pull at least one model (example with Llama 2):
```bash
ollama pull llama2
```

Other recommended models:
```bash
ollama pull mistral
ollama pull codellama
ollama pull phi
```

## Project Structure

```
context-aware-chat/
├── backend/
│   ├── main.py              # FastAPI backend server
│   ├── requirements.txt     # Python dependencies
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── App.css         # Styles
│   │   └── ...
│   ├── package.json        # Node.js dependencies
│   └── ...
└── README.md
```

## Running the Application

### 1. Start Ollama (if not already running)

```bash
ollama serve
```

### 2. Start the Backend Server

In the backend directory (or root if backend files are in root):

```bash
# Make sure virtual environment is activated
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`

### 3. Start the Frontend Development Server

In the frontend directory (or root if frontend files are in root):

```bash
npm start
```

Or if using Vite:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### 1. Configure the Application

1. Open the application in your browser (`http://localhost:3000`)
2. Click the **Settings** button (⚙️) in the top-right corner
3. Select an AI model from the dropdown (you must have pulled models via Ollama)

### 2. Upload Context

1. In the Settings panel, find the **Context Management** section
2. Click "Choose File" and select a document (.txt, .md, .pdf, or .csv)
3. Click **Upload** to process the file
4. You'll see the context information displayed

### 3. Start Chatting

1. Close the settings panel
2. Type your message in the input field
3. The AI will respond based on your uploaded context
4. Chat memory is maintained throughout the conversation

### 4. Managing Context

- **View Context**: Context information is shown in the settings panel
- **Remove Context**: Click the ❌ button next to the context info
- **Upload New Context**: Upload a new file (automatically clears chat memory)

## Configuration

### Backend Configuration

The backend runs on `http://localhost:8000` by default. You can modify the configuration in `main.py`:

- **Port**: Change the port in the `uvicorn.run()` call
- **CORS**: Modify allowed origins in the CORS middleware
- **Ollama URL**: Update `OLLAMA_BASE_URL` if Ollama runs on a different address

### Frontend Configuration

The frontend expects the backend at `http://localhost:8000`. Update `API_BASE_URL` in `App.tsx` if needed.

## Troubleshooting

### Common Issues

1. **"Failed to connect to backend"**
   - Ensure the backend server is running
   - Check if the backend URL is correct in the frontend

2. **"Could not connect to Ollama"**
   - Make sure Ollama is installed and running (`ollama serve`)
   - Verify Ollama is accessible at `http://localhost:11434`

3. **"No models available"**
   - Pull at least one model: `ollama pull llama2`
   - Restart the application after pulling models

4. **File upload fails**
   - Check file size (max 10MB)
   - Ensure file format is supported (.txt, .md, .pdf, .csv)
   - Verify backend has proper permissions

5. **Streaming not working**
   - Disable streaming in settings and try regular mode
   - Check browser console for errors

### Port Conflicts

If you encounter port conflicts:

- **Backend**: Change port in `main.py` and update frontend `API_BASE_URL`
- **Frontend**: Use a different port with `npm start -- --port 3001`

## Development

### Adding New File Types

To support additional file types, update the `extract_text_from_file()` function in `main.py`.

### Customizing the UI

Modify `App.css` to customize the appearance. The app uses a dark theme with glassmorphism effects.

### Model Management

Add new models through the settings panel or via CLI:
```bash
ollama pull <model-name>
```

## License

This project is open source. Please check the license file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Check the browser console for frontend errors
4. Check the backend logs for server errors

For additional help, please open an issue in the repository.