document.addEventListener('DOMContentLoaded', () => {
    // --- Get all element references ---
    const uploaderContainer = document.querySelector('.upload-container');
    const verifierContainer = document.querySelector('.verifier-container');
    const csvUploader = document.getElementById('csv-uploader');
    const siteNameEl = document.getElementById('site-name');
    const circleCodeEl = document.getElementById('circle-code');
    const siteCounterEl = document.getElementById('site-counter');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const exportBtn = document.getElementById('export-btn');

    const imageElements = {
        img1: document.getElementById('image-1'), link1: document.getElementById('link-1'), ts1: document.getElementById('timestamp-1'),
        img2: document.getElementById('image-2'), link2: document.getElementById('link-2'), ts2: document.getElementById('timestamp-2'),
        img3: document.getElementById('image-3'), link3: document.getElementById('link-3'), ts3: document.getElementById('timestamp-3'),
        img4: document.getElementById('image-4'), link4: document.getElementById('link-4'), ts4: document.getElementById('timestamp-4'),
    };
    
    const interactiveElements = {
        stewards: document.getElementById('stewards-count'),
        participants: document.getElementById('participants-count'),
        ratioCheck: document.getElementById('ratio-check'),
        participantCheck: document.getElementById('participant-check'),
        image1Check: document.getElementById('image1-check'),
        image4Check: document.getElementById('image4-check'),
        statusApproved: document.getElementById('status-approved'),
        statusNeedsReviewing: document.getElementById('status-needs-reviewing'),
    };

    let allSiteData = [];
    let currentSiteIndex = 0;
    const placeholder_img_url = 'https://placehold.co/400x300/F0F2F5/333333?text=Image+Not+Found';

    // --- FILE UPLOAD LOGIC USING PAPA PARSE ---
    csvUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    allSiteData = results.data;
                    uploaderContainer.classList.add('hidden');
                    verifierContainer.classList.remove('hidden');
                    currentSiteIndex = 0;
                    renderSite(currentSiteIndex);
                } else {
                    alert('The CSV file is empty or could not be read. Please check the file.');
                }
            },
            error: (error) => alert(`An error occurred: ${error.message}`),
        });
    });

    // --- RENDER FUNCTION ---
    function renderSite(index) {
        if (index < 0 || index >= allSiteData.length) return;
        const siteData = allSiteData[index];
        
        siteNameEl.textContent = siteData['What is the name of your school, organisation,\ngroup of friends or workplace?'] || 'N/A';
        circleCodeEl.textContent = 'N/A';
        ['1', '2', '3', '4'].forEach(i => {
            imageElements[`img${i}`].src = siteData[`Photo ${i}`] || placeholder_img_url;
            imageElements[`img${i}`].onerror = () => { imageElements[`img${i}`].src = placeholder_img_url; };
            imageElements[`link${i}`].href = siteData[`Photo ${i}`] || '#';
            imageElements[`ts${i}`].textContent = siteData['Submitted At'] || 'N/A';
        });
        
        interactiveElements.stewards.value = siteData['Number of stewards'] || '';
        interactiveElements.participants.value = siteData['Total number of participants present for the duration of the attempt?'] || '';
        
        const isChecked = (value) => String(value).toLowerCase() === 'true';
        interactiveElements.ratioCheck.checked = isChecked(siteData['RatioCheck']);
        interactiveElements.participantCheck.checked = isChecked(siteData['ParticipantCheck']);
        interactiveElements.image1Check.checked = isChecked(siteData['1st image acceptable']);
        interactiveElements.image4Check.checked = isChecked(siteData['4th image acceptable']);
        if (siteData['Status'] === 'Approved') {
            interactiveElements.statusApproved.checked = true;
        } else {
            interactiveElements.statusNeedsReviewing.checked = true;
        }
        siteCounterEl.textContent = `Site ${index + 1}/${allSiteData.length}`;
    }

    // --- UPDATE IN-MEMORY DATA ---
    function updateLocalData() {
        if (allSiteData.length === 0) return;
        const data = allSiteData[currentSiteIndex];
        Object.keys(interactiveElements).forEach(key => {
            const el = interactiveElements[key];
            if (el.type === 'checkbox') data[el.id] = el.checked; // This isn't quite right, needs mapping
            else if (el.type === 'radio') {
                if(el.checked) data[el.name] = el.value;
            }
            else data[el.id] = el.value;
        });
        // A more explicit mapping is better
        data['Status'] = interactiveElements.statusApproved.checked ? 'Approved' : 'Needs Reviewing';
        data['Number of stewards'] = interactiveElements.stewards.value;
        data['Total number of participants present for the duration of the attempt?'] = interactiveElements.participants.value;
        data['RatioCheck'] = interactiveElements.ratioCheck.checked;
        data['ParticipantCheck'] = interactiveElements.participantCheck.checked;
        data['1st image acceptable'] = interactiveElements.image1Check.checked;
        data['4th image acceptable'] = interactiveElements.image4Check.checked;
    }

    // --- EXPORT FUNCTIONALITY ---
    function exportToCsv() {
        updateLocalData();
        if (allSiteData.length === 0) return alert('No data to export!');
        const csvString = Papa.unparse(allSiteData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'verified_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- EVENT LISTENERS ---
    Object.values(interactiveElements).forEach(el => el.addEventListener('change', updateLocalData));
    nextBtn.addEventListener('click', () => {
        updateLocalData();
        if (currentSiteIndex < allSiteData.length - 1) { currentSiteIndex++; renderSite(currentSiteIndex); }
    });
    prevBtn.addEventListener('click', () => {
        updateLocalData();
        if (currentSiteIndex > 0) { currentSiteIndex--; renderSite(currentSiteIndex); }
    });
    exportBtn.addEventListener('click', exportToCsv);
});