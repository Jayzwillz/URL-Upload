document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const previewText = document.getElementById('previewText');
    const previewImage = document.getElementById('previewImage');

    if (!file) {
        previewText.textContent = 'No file selected';
        previewImage.style.display = 'none';
        return;
    }

    previewText.textContent = `Selected File: ${file.name}`;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.style.display = 'none';
    }
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title = document.getElementById('fileTitle').value;

    document.getElementById('response').innerHTML = `<p>Uploading...</p>`;

    try {
        const res = await fetch('/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Something went wrong!');
        }

        document.getElementById('response').innerHTML = `
            <p>${data.message}</p>
            <p><a href="${data.url}" target="_blank">${data.url}</a> - <strong>${title}</strong></p>
        `;

        let previousUploads = JSON.parse(localStorage.getItem('uploadedUrls')) || [];
        previousUploads.push({ title, url: data.url });
        localStorage.setItem('uploadedUrls', JSON.stringify(previousUploads));

        displayPreviousUrls();
    } catch (error) {
        document.getElementById('response').innerHTML = `<p>Error: ${error.message}</p>`;
    }

    e.target.reset();
    document.getElementById('previewText').textContent = 'No file selected';
    document.getElementById('previewImage').style.display = 'none';
});

function displayPreviousUrls() {
    const previousUploads = JSON.parse(localStorage.getItem('uploadedUrls')) || [];
    const previousUrlsContainer = document.getElementById('previousUrls');

    previousUrlsContainer.innerHTML = '<h3>Previous Uploads</h3>';

    if (previousUploads.length > 0) {
        const list = document.createElement('ul');
        previousUploads.reverse().forEach((upload, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="${upload.url}" target="_blank">${upload.url}</a> - <strong>${upload.title}</strong>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            list.appendChild(listItem);
        });
        previousUrlsContainer.appendChild(list);

        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteUpload(index);
            });
        });
    } else {
        previousUrlsContainer.innerHTML = '<p>No previous uploads found.</p>';
    }
}

function deleteUpload(index) {
    const previousUploads = JSON.parse(localStorage.getItem('uploadedUrls')) || [];
    const reversedIndex = previousUploads.length - 1 - index;
    previousUploads.splice(reversedIndex, 1);
    localStorage.setItem('uploadedUrls', JSON.stringify(previousUploads));
    displayPreviousUrls();
}

function deleteAllUploads() {
    if (confirm("Are you sure you want to delete all previous uploads?")) {
        localStorage.removeItem('uploadedUrls');
        displayPreviousUrls();
    }
}

displayPreviousUrls();
