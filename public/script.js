document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const charCount = document.getElementById('char-count');
    const summarizeBtn = document.getElementById('summarize-btn');
    const btnLoader = document.getElementById('btn-loader');
    const btnText = summarizeBtn.querySelector('.btn-text');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const summaryPlaceholder = document.getElementById('summary-placeholder');
    const summaryContent = document.getElementById('summary-content');
    const summaryText = document.getElementById('summary-text');

    // Update character count
    inputText.addEventListener('input', () => {
        const count = inputText.value.length;
        charCount.textContent = `${count} characters`;
    });

    // Handle Summarize button click
    summarizeBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();

        if (text.length < 50) {
            alert('Please enter at least 50 characters to summarize.');
            return;
        }

        // UI state: Loading
        summarizeBtn.disabled = true;
        btnLoader.style.display = 'block';
        btnText.textContent = 'Summarizing...';
        
        // Clear previous summary
        summaryContent.classList.add('hidden');
        summaryPlaceholder.classList.remove('hidden');
        summaryPlaceholder.textContent = 'Generating summary...';

        try {
            const response = await fetch('/generate-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (response.ok) {
                // UI state: Success
                summaryText.textContent = data.summary;
                summaryPlaceholder.classList.add('hidden');
                summaryContent.classList.remove('hidden');
                summaryContent.classList.add('fade-in');
            } else {
                // UI state: Error
                alert(data.error || 'Something went wrong.');
                summaryPlaceholder.textContent = 'Failed to generate summary.';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Network error. Is the server running?');
            summaryPlaceholder.textContent = 'Connection error.';
        } finally {
            // UI state: Reset button
            summarizeBtn.disabled = false;
            btnLoader.style.display = 'none';
            btnText.textContent = 'Generate Summary';
        }
    });

    // Handle Clear button click
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        charCount.textContent = '0 characters';
        summaryContent.classList.add('hidden');
        summaryPlaceholder.classList.remove('hidden');
        summaryPlaceholder.textContent = 'Your summary will appear here...';
    });

    // Handle Copy button click
    copyBtn.addEventListener('click', () => {
        const text = summaryText.textContent;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                const originalSvg = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span style="color: var(--primary); font-size: 0.8rem; font-weight: bold;">Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = originalSvg;
                }, 2000);
            });
        }
    });
});
