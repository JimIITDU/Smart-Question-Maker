# from langchain_community.llms import Ollama
# from langchain_community.embeddings import HuggingFaceEmbeddings
# from django.conf import settings
# import json
# import re


# def get_llm(temperature=0.7, model=None):
#     """
#     Get LLM instance using Ollama (local, free, no API keys needed).
#     Returns None if Ollama is not available (connection refused, etc).
    
#     For production use, install Ollama from https://ollama.ai
#     Then pull a model: ollama pull mistral
#     """
#     model_name = model or settings.LLM_MODEL
#     base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
    
#     try:
#         return Ollama(
#             model=model_name,
#             base_url=base_url,
#             temperature=temperature,
#             num_predict=4096,
#         )
#     except Exception as e:
#         # Return None if Ollama is not available
#         # Fallback questions will be generated instead
#         import logging
#         logger = logging.getLogger(__name__)
#         logger.warning(
#             f"Ollama not available at {base_url}. "
#             f"Using fallback questions. Error: {str(e)[:100]}"
#         )
#         return None


# def get_embeddings():
#     """
#     Get embeddings using Sentence Transformers (local, free, no API keys needed).
    
#     Downloads model automatically on first use.
#     """
#     embedding_model = getattr(settings, 'EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
    
#     return HuggingFaceEmbeddings(
#         model_name=embedding_model,
#         cache_folder=str(settings.BASE_DIR / 'models'),
#     )


# def safe_parse_json(text: str) -> list | dict:
#     """Extract and parse JSON from LLM response safely."""
#     # Strip markdown code fences
#     text = re.sub(r'```json\s*', '', text)
#     text = re.sub(r'```\s*', '', text)
#     text = text.strip()
#     try:
#         return json.loads(text)
#     except json.JSONDecodeError:
#         # Try to find JSON array or object
#         match = re.search(r'(\[.*\]|\{.*\})', text, re.DOTALL)
#         if match:
#             return json.loads(match.group(1))
#         raise ValueError(f"Could not parse JSON from LLM response: {text[:200]}")



from django.conf import settings
import json
import re
import logging

logger = logging.getLogger(__name__)


def get_llm(temperature=0.5, model=None):
    model_name = model or settings.LLM_MODEL

    # Groq (Free & Fast)
    if hasattr(settings, 'GROQ_API_KEY') and settings.GROQ_API_KEY:
        try:
            from langchain_groq import ChatGroq
            logger.info(f"Using Groq model: {model_name}")
            return ChatGroq(
                model=model_name,
                temperature=temperature,
                groq_api_key=settings.GROQ_API_KEY
            )
        except Exception as e:
            logger.warning(f"Groq failed, trying fallback: {e}")

    # Gemini fallback
    if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            logger.info("Using Gemini model")
            return ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                temperature=temperature,
                google_api_key=settings.GEMINI_API_KEY
            )
        except Exception as e:
            logger.warning(f"Gemini failed: {e}")

    # OpenAI fallback
    if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=temperature,
            openai_api_key=settings.OPENAI_API_KEY,
            max_tokens=4096
        )

    # Ollama local fallback
    try:
        from langchain_community.llms import Ollama
        return Ollama(model=model_name, temperature=temperature)
    except Exception as e:
        logger.error(f"All LLM options failed: {e}")
        raise


def get_embeddings(text: str) -> list:
    """Generate embeddings for the given text."""
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embedding = model.encode(text)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Failed to generate embeddings: {e}")
        raise

def safe_parse_json(text: str):
    """Robustly extract and parse JSON from LLM response."""
    if not text:
        raise ValueError("Empty response from LLM")

    # Remove markdown code blocks
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()

    # Direct parse attempt
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find JSON array (most common case)
    match = re.search(r'\[\s*\{[\s\S]*\}\s*\]', text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            # Try to fix truncated JSON array
            fragment = match.group(0)
            try:
                fixed = _fix_truncated_json(fragment)
                return json.loads(fixed)
            except Exception:
                pass

    # Find JSON object
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Fix common issues
    fixed = text
    fixed = re.sub(r'(?<!\\)\n(?!["\s,\]\}])', '\\n', fixed)
    fixed = re.sub(r',\s*([}\]])', r'\1', fixed)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Last resort: extract individual objects
    objects = re.findall(r'\{[^{}]*\}', text, re.DOTALL)
    if objects:
        result = []
        for obj in objects:
            try:
                result.append(json.loads(obj))
            except json.JSONDecodeError:
                continue
        if result:
            return result

    raise ValueError(f"Could not parse JSON from response. First 300 chars: {text[:300]}")


def _fix_truncated_json(text: str) -> str:
    """Fix truncated JSON by closing open brackets and braces."""
    open_braces = text.count('{') - text.count('}')
    open_brackets = text.count('[') - text.count(']')

    # Remove trailing comma if any
    text = re.sub(r',\s*$', '', text.strip())

    # Close open braces and brackets
    text += '}' * open_braces
    text += ']' * open_brackets

    return text