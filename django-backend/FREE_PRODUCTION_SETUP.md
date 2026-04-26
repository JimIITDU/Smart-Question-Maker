# FREE Production Setup Guide

This project is now configured to run **completely free** with no API costs!

## ✅ Free Components Used:

1. **LLM (Large Language Model)**: **Ollama** - Local, Free, No API Keys
   - Models available: Mistral, Llama 2, Neural Chat, Orca, Dolphin, etc.
   
2. **Embeddings**: **HuggingFace Sentence Transformers** - Local, Free, No API Keys
   - Pre-trained models for text embeddings
   
3. **Vector Store**: **FAISS** - Free, Local Vector Database
   
4. **Database**: **SQLite** - Free, File-Based
   
5. **Web Framework**: **Django REST Framework** - Free, Open Source
   
6. **Task Queue**: **Celery + Redis** - Free, Open Source

---

## 🚀 Installation & Setup:

### Step 1: Install Ollama (One-Time Setup)
Ollama allows you to run powerful LLMs completely locally with no internet required after download.

**Windows:**
1. Download from: https://ollama.ai
2. Install and run `Ollama.exe`
3. Open PowerShell and run:
   ```bash
   ollama pull mistral
   ```
   Other models: `ollama pull llama2`, `ollama pull neural-chat`, `ollama pull orca`

**macOS:**
```bash
brew install ollama
ollama pull mistral
```

**Linux:**
```bash
curl https://ollama.ai/install.sh | sh
ollama pull mistral
```

### Step 2: Start Ollama Server
```bash
ollama serve
```
This runs on `http://localhost:11434` (default)

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
# Or individual installation:
pip install sentence-transformers  # For embeddings
```

### Step 4: Start Redis (for Celery task queue)
```bash
# Windows: Download from https://github.com/microsoftarchive/redis/releases
redis-server

# macOS:
brew install redis
redis-server

# Linux:
redis-server
```

### Step 5: Run Django Server
```bash
python manage.py migrate
python manage.py runserver
```

Server runs on: http://localhost:8000

---

## 📊 Performance Expectations:

### Model Quality vs Speed Tradeoff:

| Model | Speed | Quality | RAM Usage | Best For |
|-------|-------|---------|-----------|----------|
| **Mistral** | ⚡⚡ | ⭐⭐⭐⭐ | 7GB | Recommended (Best balance) |
| Llama 2 | ⚡ | ⭐⭐⭐ | 8GB | Good quality, slower |
| Neural Chat | ⚡⚡⚡ | ⭐⭐⭐ | 5GB | Fastest, decent quality |
| Orca | ⚡ | ⭐⭐⭐⭐⭐ | 13GB | Highest quality, slowest |

**Recommendation**: Start with `mistral` - best balance of speed and quality.

---

## 🔧 Configuration:

### `.env` File (Already Configured):
```dotenv
# Local Ollama
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=mistral
LLM_TYPE=ollama

# Local HuggingFace Embeddings
EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_TYPE=local

# Vector Store
VECTOR_STORE_TYPE=faiss

# Database (SQLite - Free)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

### Switching Models:
Edit `.env` and change:
```dotenv
LLM_MODEL=llama2  # or neural-chat, orca, dolphin
```

Then restart the server.

---

## 📈 Scaling to Production:

For production deployment (free):

1. **Web Server**: Use Gunicorn (free)
   ```bash
   pip install gunicorn
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

2. **Reverse Proxy**: Use Nginx (free)
   ```bash
   sudo apt install nginx
   ```

3. **Task Worker**: Run Celery Worker
   ```bash
   celery -A tasks worker -l info
   ```

4. **Monitoring**: Use Prometheus + Grafana (free)

---

## ⚠️ Important Notes:

1. **First Run**: First query will be slower as models download (~7GB for Mistral)
   
2. **Memory Requirements**: 
   - Mistral: 8GB RAM minimum
   - Run `ollama list` to see available models
   
3. **GPU Acceleration** (Optional - For Faster Responses):
   - NVIDIA: Ollama auto-detects CUDA
   - AMD: Ollama supports ROCm
   - Apple: Metal acceleration auto-enabled
   
4. **No Internet Needed**: After initial model download, everything runs locally!

5. **Cost Comparison**:
   - **Old Setup**: $20-50/month (OpenAI API)
   - **New Setup**: $0/month (Free) ✅

---

## 🆘 Troubleshooting:

### Error: "Failed to connect to Ollama"
- Ensure Ollama is running: `ollama serve`
- Check URL in `.env`: `OLLAMA_BASE_URL=http://localhost:11434`

### Error: "Model not found"
```bash
ollama pull mistral
```

### Slow Responses
- Use faster model: `neural-chat`
- Enable GPU acceleration
- Increase system RAM

### Out of Memory Error
- Use smaller model: `ollama pull phi` (2GB)
- Close other applications

---

## 📚 Available Models:

Free models via Ollama:
- `mistral` - 7B params - Recommended
- `llama2` - 7B params - Good quality
- `neural-chat` - 7B params - Fast
- `orca-mini` - 3B params - Lightweight
- `phi` - 2.7B params - Very lightweight
- `dolphin-mixtral` - Mix of experts - High quality

Download any with: `ollama pull <model-name>`

---

## ✨ Zero Cost Forever!

This entire system:
- ✅ Costs $0/month
- ✅ No API keys needed
- ✅ Runs 100% locally
- ✅ No rate limits
- ✅ Data stays private
- ✅ Works offline after setup

Enjoy your free production AI system! 🚀
