const API_URL = 'https://ru.libretranslate.com/translate';
const MAX_TEXT_LENGTH = 5000;

const elements = {
    sourceText: document.getElementById('source-text'),
    translationResult: document.getElementById('translation-result'),
    translateBtn: document.getElementById('translate-btn'),
    copyBtn: document.getElementById('copy-btn'),
    swapBtn: document.getElementById('swap-languages'),
    sourceLanguage: document.getElementById('source-language'),
    targetLanguage: document.getElementById('target-language')
};

async function translateText(text, sourceLang, targetLang) {
    if (!text.trim()) return '';
    
    if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(`Превышен лимит (${MAX_TEXT_LENGTH} символов)`);
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang
            }),
            headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сети');
        }
        
        const data = await response.json();
        return data.translatedText || 'Перевод не найден';
    } catch (error) {
        console.error('Ошибка перевода:', error);
        throw new Error('Сервис перевода временно недоступен');
    }
}

async function handleTranslation() {
    const text = elements.sourceText.value;
    const sourceLang = elements.sourceLanguage.value;
    const targetLang = elements.targetLanguage.value;
    
    elements.translationResult.textContent = 'Перевожу...';
    elements.translateBtn.disabled = true;
    
    try {
        const translation = await translateText(text, sourceLang, targetLang);
        elements.translationResult.textContent = translation;
    } catch (error) {
        elements.translationResult.textContent = error.message;
    } finally {
        elements.translateBtn.disabled = false;
    }
}

function handleCopy() {
    const text = elements.translationResult.textContent;
    if (!text || text.includes('...')) return;
    
    navigator.clipboard.writeText(text).then(() => {
        elements.copyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            elements.copyBtn.textContent = 'Копировать';
        }, 2000);
    });
}

function swapLanguages() {
    const temp = elements.sourceLanguage.value;
    elements.sourceLanguage.value = elements.targetLanguage.value;
    elements.targetLanguage.value = temp;
    
    if (elements.sourceText.value.trim()) {
        handleTranslation();
    }
}

function init() {
    elements.translateBtn.addEventListener('click', handleTranslation);
    elements.copyBtn.addEventListener('click', handleCopy);
    elements.swapBtn.addEventListener('click', swapLanguages);

    let typingTimer;
    elements.sourceText.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            if (elements.sourceText.value.trim()) {
                handleTranslation();
            }
        }, 800);
    });
    
    elements.sourceText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleTranslation();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
