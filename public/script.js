document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const summaryLength = document.getElementById('summary-length');
    const charCount = document.getElementById('char-count');
    
    // Action Buttons
    const summarizeBtn = document.getElementById('summarize-btn');
    const btnLoader = document.getElementById('btn-loader');
    const summarizeBtnText = summarizeBtn.querySelector('.btn-text');
    
    const humanizeCheckBtn = document.getElementById('humanize-check-btn');
    const checkLoader = document.getElementById('check-loader');
    const checkBtnText = document.getElementById('check-btn-text');

    const refineBtn = document.getElementById('refine-btn');
    const refineLoader = document.getElementById('refine-loader');
    const refineBtnText = document.getElementById('refine-btn-text');

    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    
    // Insights Panel Elements
    const summaryPlaceholder = document.getElementById('summary-placeholder');
    const summaryContent = document.getElementById('summary-content');
    const summaryText = document.getElementById('summary-text');

    const scoreHuman = document.getElementById('score-human');
    const scoreAi = document.getElementById('score-ai');
    const barHuman = document.getElementById('bar-human');
    const barAi = document.getElementById('bar-ai');
    const humanizationStatus = document.getElementById('humanization-status');
    
    // File upload elements
    const fileUpload = document.getElementById('file-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadBtnText = document.getElementById('upload-btn-text');
    const uploadLoader = document.getElementById('upload-loader');

    // Update character count
    const updateCharCount = () => {
        const count = inputText.value.length;
        charCount.textContent = `${count} characters`;
    };

    inputText.addEventListener('input', updateCharCount);

    // Handle File Upload click
    uploadBtn.addEventListener('click', () => {
        fileUpload.click();
    });

    // Handle File selection
    fileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fileUpload.value = '';

        const formData = new FormData();
        formData.append('document', file);

        uploadBtn.disabled = true;
        uploadLoader.style.display = 'block';
        uploadBtnText.textContent = 'Extracting...';

        try {
            const response = await fetch('/upload-extract', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                inputText.value = data.text;
                updateCharCount();
            } else {
                alert(data.error || 'Failed to extract text from file.');
            }
        } catch (error) {
            console.error('File extraction error:', error);
            alert('Network error while extracting text.');
        } finally {
            uploadBtn.disabled = false;
            uploadLoader.style.display = 'none';
            uploadBtnText.textContent = 'Upload Document';
        }
    });

    // Handle Summarize button click
    summarizeBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();

        if (text.length < 50) {
            alert('Please enter at least 50 characters to summarize.');
            return;
        }

        summarizeBtn.disabled = true;
        btnLoader.style.display = 'block';
        summarizeBtnText.textContent = 'Summarizing...';
        
        summaryContent.classList.add('hidden');
        summaryPlaceholder.classList.remove('hidden');
        summaryPlaceholder.textContent = 'Generating summary...';

        try {
            const response = await fetch('/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: text, 
                    length: parseInt(summaryLength.value, 10) || 150 
                })
            });

            const data = await response.json();

            if (response.ok) {
                summaryText.textContent = data.summary;
                summaryPlaceholder.classList.add('hidden');
                summaryContent.classList.remove('hidden');
                summaryContent.classList.add('fade-in');
            } else {
                alert(data.error || 'Something went wrong.');
                summaryPlaceholder.textContent = 'Failed to generate summary.';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Network error. Is the server running?');
            summaryPlaceholder.textContent = 'Connection error.';
        } finally {
            summarizeBtn.disabled = false;
            btnLoader.style.display = 'none';
            summarizeBtnText.textContent = 'Summarize';
        }
    });

    // Handle Clear button click
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        updateCharCount();
        
        summaryContent.classList.add('hidden');
        summaryPlaceholder.classList.remove('hidden');
        summaryPlaceholder.textContent = 'Your AI-generated summary will appear here...';
        
        scoreHuman.textContent = '0%';
        scoreAi.textContent = '0%';
        barHuman.style.width = '0%';
        barAi.style.width = '0%';
        humanizationStatus.textContent = "Paste text and click 'Analyze AI' to detect AI-generated content.";
    });

    // Handle Copy button click
    copyBtn.addEventListener('click', () => {
        const text = summaryText.textContent;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                const originalSvg = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span style="color: var(--primary); font-size: 0.8rem; font-weight: bold;">Copied!</span>';
                setTimeout(() => { copyBtn.innerHTML = originalSvg; }, 2000);
            });
        }
    });

    // Humanization Analysis Logic
    humanizeCheckBtn.addEventListener('click', async () => {
        let text = summaryText.textContent.trim();
        if (!text || summaryContent.classList.contains('hidden')) {
            text = inputText.value.trim();
        }
        if (text.length < 50) {
            alert('Not enough text to analyze. Please enter at least 50 characters or generate a summary.');
            return;
        }

        humanizeCheckBtn.disabled = true;
        checkLoader.style.display = 'block';
        checkBtnText.textContent = 'Analyzing...';
        
        scoreHuman.textContent = '0%';
        scoreAi.textContent = '0%';
        barHuman.style.width = '0%';
        barAi.style.width = '0%';
        humanizationStatus.textContent = 'Analyzing text patterns using AI detection model...';

        try {
            const response = await fetch('/check-humanization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (response.ok) {
                scoreHuman.textContent = `${data.humanScore}%`;
                scoreAi.textContent = `${data.aiScore}%`;
                
                setTimeout(() => {
                    barHuman.style.width = `${data.humanScore}%`;
                    barAi.style.width = `${data.aiScore}%`;
                }, 100);

                humanizationStatus.textContent = data.humanScore > 50 
                    ? 'Looks good! This text reads mostly like human writing.' 
                    : 'Warning: This text appears heavily AI-generated.';
            } else {
                humanizationStatus.textContent = data.error || 'Failed to analyze text.';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            humanizationStatus.textContent = 'Network error during analysis.';
        } finally {
            humanizeCheckBtn.disabled = false;
            checkLoader.style.display = 'none';
            checkBtnText.textContent = 'Analyze AI';
        }
    });

    // Refine Text Logic
    refineBtn.addEventListener('click', async () => {
        const text = summaryText.textContent.trim();
        if (!text || summaryContent.classList.contains('hidden')) {
            alert('Please generate a summary first before using Auto-Humanize.');
            return;
        }

        if (text.length < 10) return;

        refineBtn.disabled = true;
        refineLoader.style.display = 'block';
        refineBtnText.textContent = 'Refining...';
        humanizationStatus.textContent = 'Rewriting text to sound more human...';

        try {
            const response = await fetch('/refine-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (response.ok && data.refinedText) {
                // Update the generated summary
                summaryText.textContent = data.refinedText;
                
                // Re-run humanization check automatically
                humanizeCheckBtn.click();
            } else {
                humanizationStatus.textContent = data.error || 'Failed to refine text.';
            }
        } catch (error) {
            console.error('Refine error:', error);
            humanizationStatus.textContent = 'Network error while refining.';
        } finally {
            refineBtn.disabled = false;
            refineLoader.style.display = 'none';
            refineBtnText.textContent = 'Auto-Humanize';
        }
    });
});
