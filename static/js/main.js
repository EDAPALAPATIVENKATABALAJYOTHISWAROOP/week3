// AgriPredict AI - Modern Client Logic Controller

// Session History Array
let sessionHistory = [];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    // Render initial badges
    updateBadge('crop-n', document.getElementById('crop-n').value);
    updateBadge('crop-p', document.getElementById('crop-p').value);
    updateBadge('crop-k', document.getElementById('crop-k').value);
    updateBadge('crop-ph', document.getElementById('crop-ph').value);
    updateBadge('crop-temp', document.getElementById('crop-temp').value + '°C');
    updateBadge('crop-humidity', document.getElementById('crop-humidity').value + '%');
    updateBadge('crop-rainfall', document.getElementById('crop-rainfall').value + ' mm');

    updateBadge('fert-temp', document.getElementById('fert-temp').value + '°C');
    updateBadge('fert-humidity', document.getElementById('fert-humidity').value + '%');
    updateBadge('fert-moisture', document.getElementById('fert-moisture').value + '%');
    updateBadge('fert-n', document.getElementById('fert-n').value);
    updateBadge('fert-k', document.getElementById('fert-k').value);
    updateBadge('fert-p', document.getElementById('fert-p').value);
});

// Tab/Mode Switching
function switchMode(mode) {
    const tabCrop = document.getElementById('tab-crop');
    const tabFert = document.getElementById('tab-fertilizer');
    const panelCrop = document.getElementById('panel-crop');
    const panelFert = document.getElementById('panel-fertilizer');
    
    // Reset active states
    tabCrop.classList.remove('active');
    tabFert.classList.remove('active');
    panelCrop.classList.remove('active');
    panelFert.classList.remove('active');
    
    if (mode === 'crop') {
        tabCrop.classList.add('active');
        panelCrop.classList.add('active');
    } else {
        tabFert.classList.add('active');
        panelFert.classList.add('active');
    }
    
    // Hide previous predictions on tab switch to keep UI clean
    hideResult();
}

// Update Badge Text next to Sliders
function updateBadge(id, value) {
    const badge = document.getElementById(`${id}-badge`);
    if (badge) {
        badge.textContent = value;
    }
}

// Crop SVGs Dictionary
const CROP_SVGS = {
    plant: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    fruit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    grain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v14M6 6h10M6 10h10"/></svg>`,
    coffee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>`
};

function getCropIcon(cropName) {
    const name = cropName.toLowerCase();
    if (name.includes('rice') || name.includes('jute') || name.includes('cotton') || name.includes('maize')) {
        return CROP_SVGS.grain;
    } else if (name.includes('apple') || name.includes('orange') || name.includes('mango') || name.includes('grapes') || name.includes('banana') || name.includes('papaya') || name.includes('coconut') || name.includes('watermelon') || name.includes('muskmelon') || name.includes('pomegranate')) {
        return CROP_SVGS.fruit;
    } else if (name.includes('coffee')) {
        return CROP_SVGS.coffee;
    }
    return CROP_SVGS.plant;
}

// Fertilizer SVGs Dictionary
const FERT_SVGS = {
    chemical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.75 18.5A2 2 0 0 0 6.5 21.5h11a2 2 0 0 0 1.75-3L14 9.3V2h-4z"/><path d="M8.5 2h7M7 16h10"/></svg>`,
    urea: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>`,
    blend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`
};

function getFertilizerIcon(fertName) {
    const name = fertName.toLowerCase();
    if (name.includes('urea')) {
        return FERT_SVGS.urea;
    } else if (name.includes('dap') || name.includes('28-28') || name.includes('20-20')) {
        return FERT_SVGS.chemical;
    }
    return FERT_SVGS.blend;
}

// Submit Crop Recommendation Form
function submitCropForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('crop-form');
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.querySelector('span').textContent;
    
    // Show Loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = "Analyzing Soil & Climatic Factors...";
    
    const data = {
        N: parseFloat(document.getElementById('crop-n').value),
        P: parseFloat(document.getElementById('crop-p').value),
        K: parseFloat(document.getElementById('crop-k').value),
        ph: parseFloat(document.getElementById('crop-ph').value),
        temperature: parseFloat(document.getElementById('crop-temp').value),
        humidity: parseFloat(document.getElementById('crop-humidity').value),
        rainfall: parseFloat(document.getElementById('crop-rainfall').value)
    };
    
    fetch('/api/predict-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = originalText;
        
        if (res.success) {
            displayResult('crop', res.result, res.message, data);
            
            // Add to session history
            addToHistory({
                type: 'crop',
                result: res.result,
                timestamp: new Date().toLocaleTimeString(),
                details: `NPK: ${data.N}-${data.P}-${data.K} | pH: ${data.ph} | Temp: ${data.temperature}°C`
            });
        } else {
            alert("Error: " + (res.error || "Failed to predict crop recommendation."));
        }
    })
    .catch(err => {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = originalText;
        alert("Server communication error occurred.");
        console.error(err);
    });
}

// Submit Fertilizer Recommendation Form
function submitFertilizerForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('fertilizer-form');
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.querySelector('span').textContent;
    
    // Show Loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = "Analyzing Soil Chemistry & Crop Type...";
    
    const data = {
        soil_type: document.getElementById('fert-soil').value,
        crop_type: document.getElementById('fert-crop').value,
        temperature: parseFloat(document.getElementById('fert-temp').value),
        humidity: parseFloat(document.getElementById('fert-humidity').value),
        moisture: parseFloat(document.getElementById('fert-moisture').value),
        nitrogen: parseFloat(document.getElementById('fert-n').value),
        potassium: parseFloat(document.getElementById('fert-k').value),
        phosphorous: parseFloat(document.getElementById('fert-p').value)
    };
    
    fetch('/api/predict-fertilizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = originalText;
        
        if (res.success) {
            displayResult('fertilizer', res.result, res.message, data);
            
            // Add to session history
            addToHistory({
                type: 'fertilizer',
                result: res.result,
                timestamp: new Date().toLocaleTimeString(),
                details: `Crop: ${data.crop_type} | Soil: ${data.soil_type} | NPK: ${data.nitrogen}-${data.potassium}-${data.phosphorous}`
            });
        } else {
            alert("Error: " + (res.error || "Failed to recommend fertilizer."));
        }
    })
    .catch(err => {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = originalText;
        alert("Server communication error occurred.");
        console.error(err);
    });
}

// Render Result visual card
function displayResult(type, name, message, inputData) {
    const resultCard = document.getElementById('prediction-result-card');
    const resultTitle = document.getElementById('result-title');
    const resultVerdict = document.getElementById('result-verdict');
    const resultDesc = document.getElementById('result-desc');
    const resultMetrics = document.getElementById('result-metrics');
    const iconContainer = document.getElementById('result-icon-container');
    
    // Inject Custom SVGs
    if (type === 'crop') {
        resultCard.style.borderColor = 'var(--primary)';
        resultTitle.textContent = "RECOMMENDED CROP TO CULTIVATE";
        iconContainer.innerHTML = getCropIcon(name);
        
        // Build Metric Summary Pills
        resultMetrics.innerHTML = `
            <div class="metric-tag"><span class="lbl">NPK Balance</span><span class="val">${inputData.N}-${inputData.P}-${inputData.K}</span></div>
            <div class="metric-tag"><span class="lbl">Soil pH</span><span class="val">${inputData.ph}</span></div>
            <div class="metric-tag"><span class="lbl">Rainfall</span><span class="val">${inputData.rainfall} mm</span></div>
        `;
    } else {
        resultCard.style.borderColor = 'var(--accent)';
        resultTitle.textContent = "RECOMMENDED FERTILIZER FEED";
        iconContainer.innerHTML = getFertilizerIcon(name);
        
        // Build Metric Summary Pills
        resultMetrics.innerHTML = `
            <div class="metric-tag"><span class="lbl">Soil</span><span class="val">${inputData.soil_type}</span></div>
            <div class="metric-tag"><span class="lbl">Crop</span><span class="val">${inputData.crop_type}</span></div>
            <div class="metric-tag"><span class="lbl">Moisture</span><span class="val">${inputData.moisture}%</span></div>
            <div class="metric-tag"><span class="lbl">NPK Ratio</span><span class="val">${inputData.nitrogen}-${inputData.potassium}-${inputData.phosphorous}</span></div>
        `;
    }
    
    resultVerdict.textContent = name;
    resultDesc.textContent = message;
    
    // Trigger slideUp animation
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hide Result Card
function hideResult() {
    const resultCard = document.getElementById('prediction-result-card');
    if (resultCard) {
        resultCard.style.display = 'none';
    }
}

// Add Item to History
function addToHistory(item) {
    sessionHistory.unshift(item); // Add to the top
    renderHistory();
}

// Render Session History
function renderHistory() {
    const container = document.getElementById('history-container');
    if (!container) return;
    
    if (sessionHistory.length === 0) {
        container.innerHTML = `<div class="no-history-msg">No predictions recorded in this session. Submit a form to start.</div>`;
        return;
    }
    
    let html = '';
    sessionHistory.forEach(item => {
        const badgeClass = item.type === 'crop' ? 'badge-crop-type' : 'badge-fert-type';
        const typeLabel = item.type === 'crop' ? 'Crop' : 'Fertilizer';
        
        html += `
            <div class="history-item">
                <div class="hist-left">
                    <span class="hist-badge ${badgeClass}">${typeLabel}</span>
                    <div class="hist-details">
                        <h5>${item.result}</h5>
                        <p>${item.details}</p>
                    </div>
                </div>
                <div class="hist-right">${item.timestamp}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Clear History Log
function clearHistory() {
    sessionHistory = [];
    renderHistory();
}
