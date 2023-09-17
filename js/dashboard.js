function updateCurrentTime() {
    const currentTimeElement = document.getElementById("current-time");
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Bangkok'
    };
    const currentTime = new Date().toLocaleTimeString('th-TH', options);
    currentTimeElement.textContent = currentTime;
}
updateCurrentTime();
setInterval(updateCurrentTime, 1000);

if (!localStorage.getItem('email')) {
    window.location.href = "/login.html";
}

const email = localStorage.getItem('email');

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

fetch("https://thity-api.cleverapps.io/users", requestOptions)
    .then(response => {
        return response.json()
    })
    .then(result => {
        const usersContainer = document.getElementById('usersContainer');

        for (let i = 0; i < result.data.length; i++) {
            const user = result.data[i];
            let HTML;
            HTML = `
                <div class="card-user">
                    <div class="card-flex" onclick="openGetLinks('${user.email}')">
                       <div class="key">
                            <p>ID</p>
                            <p>Email</p>
                            <p>Password</p>
                            <p>Role</p>
                        </div>
                        <div class="value">
                            <p>${user.id}</p>
                            <p>${user.email}</p>
                            <p>${user.password}</p>
                            <p>${user.role}</p>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: end;">
                        <button class="delete-btn" onclick="deleteUser(${user.id});">
                            <i style="color: #fff;" class="material-icons">delete</i>
                        </button>
                    </div>
                </div>
            `;
            usersContainer.innerHTML += HTML;
        }
    })
    .catch(error => {
        console.log('error', error);
        loader.style.display = 'none';
    });

function openGetLinks(email) {
    var overlay = document.getElementById("overlay");
    overlay.style.display = "block";

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
            const detailBody = document.getElementById('detailBody');
            detailBody.innerHTML = '';

            for (let i = 0; i < result.data.length; i++) {
                const link = result.data[i];
                const shortLink = `${link.domain}${link.short_link}`;
                const imageElement = document.createElement('img');
                imageElement.src = link.icon || '/imgs/www-icon.png';
                let HTML = `
                    <tr>
                        <td class="img-icon">${imageElement.outerHTML}</td>
                        <td class="blur-link">
                            <a href="${link.original_link}">${link.original_link}</a>
                        </td>
                        <td onclick="redirectLink('${shortLink}')" style="cursor: pointer;">${shortLink}</td>
                        <td class="blur-link">${link.title}</td>
                        <td>${link.timestamp}</td>
                    <tr>
                `;
                detailBody.innerHTML += HTML;

            }
        })
        .catch(error => {
            console.log('error', error);
            loader.style.display = 'none';
        });
}

function deleteUser(id) {
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

    fetch("https://thity-api.cleverapps.io/deleteUser", requestOptions)
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

function closeGetLinks() {
    var overlay = document.getElementById("overlay");
    overlay.style.display = "none";
}

function redirectLink(link) {
    window.open(link, '_blank');
}