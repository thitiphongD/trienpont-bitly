if (!localStorage.getItem('email')) {
    window.location.href = "/login.html";
}

const email = localStorage.getItem('email');

if (email) {
    const firstChar = email.charAt(0).toUpperCase(); // Get the first character in uppercase
    const secondChar = email.charAt(1).toLowerCase(); // Get the second character in lowercase
    const formattedEmail = firstChar + secondChar;
    document.getElementById('user-email').textContent = formattedEmail;
}

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "email": email
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("https://thity-api.cleverapps.io/getLink", requestOptions)
    .then(response => {
        return response.json()
    })
    .then(result => {
        const shortLinkContainer = document.getElementById("shortLinkContainer");

        for (let i = 0; i < result.data.length; i++) {

            const shortURL = `${result.data[i].domain}${result.data[i].short_link}`

            const shortLink = `
                <div class="card-link">
                    <img class="web-icon-from" src="${result.data[i].icon !== null ? result.data[i].icon : '/imgs/www-icon.png'}" alt="web icon">

                    <div class="detail-web">
                        <p class="web-title">${result.data[i].title}</p>
                        <div>
                            <p id="copy-link" onclick="redirectLink('${result.data[i].short_link}')" href="#">${shortURL} </p>
                            <a target="_blank" href="${result.data[i].original_link}">${result.data[i].original_link}</a>
                        </div>
                        <div class="detail-short">
                            <i class="material-icons">date_range</i>
                            <p>${result.data[i].timestamp}</p>
                        </div>

                    </div>
                    <div class="action-card">
                        <button class="copy-button" onclick="copyLink('${shortURL}')">
                            <i class="material-icons">content_copy</i>
                        </button>
                        <button onclick="openEditOverlay(${result.data[i].id});">
                            <i class="material-icons">edit</i>
                        </button>
                        <button onclick="openDeleteOverlay(${result.data[i].id});">
                            <i class="material-icons">delete</i>
                        </button>
                    </div>
                </div>
            `;

            shortLinkContainer.innerHTML += shortLink;
        }
    })
    .catch(error => {
        console.error('Email not found in localStorage');
    });


function createLink() {
    showLoader();

    const newDestination = document.getElementById('newDestination').value;
    const newTitle = document.getElementById('newTitle').value;
    const newBackHalf = document.getElementById('newBackHalf').value;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "longUrl": newDestination,
        "newTitle": newTitle,
        "newBackHalf": newBackHalf,
        "email": email
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://thity-api.cleverapps.io/shortLink", requestOptions)
        .then(response => {
            hideLoader();
            return response.json()
        })
        .then(result => {
            if (result.code === 400) {
                const errorMessage = result.message;
                openCreateLinkFail(errorMessage)
            }

            if (result.code === 200) {
                openCreateLinkSuccess();
            }
        })
        .catch(error => {
            console.log('error', error)
        });
}

function showContent(contentId) {
    document.querySelectorAll('main > div').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(contentId).style.display = 'block';
}

function copyLink(link) {
    var textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    var message = document.getElementById("message");
    message.textContent = "Copied ✅ " + link;
    message.style.display = "block";
    setTimeout(function () {
        message.style.display = "none";
    }, 1000);
}

function redirectLink(link) {
    const redirectUrl = `https://thity-api.cleverapps.io/${link}`;

    window.open(redirectUrl, '_blank');
}

function downloadQRCode() {
    var qrCodeImage = document.getElementById('qrCodeImage');
    var downloadLink = document.createElement('a');
    downloadLink.href = qrCodeImage.src;
    downloadLink.download = 'qrcode.png';
    downloadLink.click();
}

function toggleDropdown() {
    var dropdownContent = document.querySelector(".dropdown-content");
    var isHidden = window.getComputedStyle(dropdownContent).display === 'none';

    dropdownContent.style.display = isHidden ? 'block' : 'none';
}

document.addEventListener("click", function (event) {
    var dropdownContent = document.querySelector(".dropdown-content");
    var dropdownButton = document.querySelector(".new-link-btn");

    if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.style.display = 'none';
    }
});

function openEditOverlay(id) {
    const editOverlay = document.getElementById("editOverlay");
    editOverlay.style.display = "block";

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "id": id
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://thity-api.cleverapps.io/getLinkByID", requestOptions)
        .then(response => {
            return response.json()
        })
        .then(result => {
            console.log(result);
            const id = result.data[0].id;
            const inputID = document.getElementById('editID');
            inputID.innerText = id;

            const title = result.data[0].title;
            const inputTitle = document.getElementById('editInputTitle');
            inputTitle.value = title;

            const backHalf = result.data[0].short_link;
            const inputBackHalf = document.getElementById('editBackHalf');
            inputBackHalf.value = backHalf;
        })
        .catch(error => {
            console.log('error', error)
        });
}

function editLink() {
    const inputTitle = document.getElementById('editInputTitle').value;
    const inputBackHalf = document.getElementById('editBackHalf').value;
    const inputID = document.getElementById('editID').textContent;
    var id = parseInt(inputID);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "id": id,
        "editTitle": inputTitle,
        "editBackHalf": inputBackHalf
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://thity-api.cleverapps.io/updateLink", requestOptions)
        .then(response => {
            return response.json()
        })
        .then(result => {
            console.log(result)
            if (result.code === 200) {
                alert('Success');
                window.location.reload();
            }
        })
        .catch(error => {
            console.log('error', error)
        });
}

function closeEditOverlay() {
    const editOverlay = document.getElementById("editOverlay");
    editOverlay.style.display = "none";
}

function openDeleteOverlay(id) {
    document.getElementById('linkIdToDelete').textContent = id;
    const editOverlay = document.getElementById("deleteOverlay");
    editOverlay.style.display = "block";
}

function deleteLink() {

    var id = document.getElementById('linkIdToDelete').textContent;

    id = parseInt(id)
    console.log(id);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "id": id
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://thity-api.cleverapps.io/deleteLink", requestOptions)
        .then(response => {
            return response.json()
        })
        .then(result => {
            console.log(result)
            if (result.code === 200) {
                window.location.reload();
            }
        })
        .catch(error => {
            console.log('error', error)
        });
}

function closeDeleteOverlay() {
    const editOverlay = document.getElementById("deleteOverlay");
    editOverlay.style.display = "none";
}

function openEditQRCode() {
    const editOverlay = document.getElementById("editQRcode");
    editOverlay.style.display = "block";
}

function closeEditQRCode() {
    const editOverlay = document.getElementById("editQRcode");
    editOverlay.style.display = "none";
}

function openNewLink() {
    const newLink = document.getElementById("newLink");
    newLink.style.display = "block";
}

function closeNewLink() {
    const newLink = document.getElementById("newLink");
    newLink.style.display = "none";

    const newDestinationInput = document.getElementById("newDestination");
    const newTitleInput = document.getElementById("newTitle");
    const newBackHalfInput = document.getElementById("newBackHalf");

    newDestinationInput.value = "";
    newTitleInput.value = "";
    newBackHalfInput.value = "";
}

function openNewQR() {
    const newQr = document.getElementById("newQr");
    newQr.style.display = "block";
}

function closeNewQR() {
    const newQr = document.getElementById("newQr");
    newQr.style.display = "none";
}

function openQrSuccess() {
    const qrSuccess = document.getElementById("qrSuccess");
    qrSuccess.style.display = "block";
}

function closeQrSuccess() {
    const qrSuccess = document.getElementById("qrSuccess");
    qrSuccess.style.display = "none";
}

function openCreateLinkSuccess() {
    const createLinkSuccess = document.getElementById("createLinkSuccess");
    createLinkSuccess.style.display = "block";
}

function closeCreateLinkSuccess() {
    const createLinkSuccess = document.getElementById("createLinkSuccess");
    createLinkSuccess.style.display = "none";
    window.location.reload();
}

function openCreateLinkFail(error) {
    const successMessageElement = document.getElementById("failMessage");
    successMessageElement.textContent = error; // Update the content with the error message
    const createLinkFail = document.getElementById("createLinkFail");
    createLinkFail.style.display = "block";
}

function closeCreateLinkFail() {
    const createLinkFail = document.getElementById("createLinkFail");
    createLinkFail.style.display = "none";
}

function toErrorPage() {
    window.open("/410.html", '_blank');
}

function showLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
}