var register = document.getElementById("openRegister");
var openModalBtn = document.getElementById("openModalBtn");
var closeModalBtn = document.getElementById("closeModalBtn");

function openModal() {
    register.style.display = "block";
}

function closeModal() {
    register.style.display = "none";
}

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);

window.addEventListener("click", function (event) {
    if (event.target == register) {
        closeModal();
    }
});
const popup = document.getElementById("popup");

function openPopup() {
    popup.style.display = "block";
}

function closePopup() {
    popup.style.display = "none";
    window.location.reload();
}

function openFailPopup(error) {
    var openFailPopup = document.getElementById('failPopup');
    var errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = error;

    openFailPopup.style.display = 'block';
}

function closeFailPopup() {
    var closeFailPopup = document.getElementById('failPopup');
    closeFailPopup.style.display = 'none';
    window.location.reload();
}

function Login() {
    showLoader();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log(email, password);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "email": email,
        "password": password
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://thity-api.cleverapps.io/login", requestOptions)
        .then(response => response.json())
        .then(result => {
            hideLoader();
            if (result.code === 200 && result.role === 'User') {
                localStorage.setItem('email', result.email);
                window.location.href = "home.html";
            } else if (result.code === 200 && result.role === 'Admin') {
                localStorage.setItem('email', result.email);
                window.location.href = "/admin/dashboard.html";
            } else {
                openPopup();
            }
        })
        .catch(error => {
            console.log('error', error)
        });
}

const passwordInput = document.getElementById('password');
passwordInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        Login();
    }
});


function Register() {
    showLoader();

    const signupEmail = document.getElementById('signupEmail').value;
    const signupPassword = document.getElementById('signupPassword').value;
    const signupConfirmPassword = document.getElementById('signupConfirmPassword').value;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "email": signupEmail,
        "password": signupPassword,
        "confirmPassword": signupConfirmPassword
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://thity-api.cleverapps.io/register", requestOptions)
        .then(response => {
            hideLoader();
            return response.json()
        })
        .then(result => {
            console.log(result)
            if (result.code === 400) {
                openFailPopup(result.message);
            }

            if (result.code === 200) {
                window.location.reload();
            }
        })
        .catch(error => {
            console.log('error', error)
        });
}

function showLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
}

localStorage.removeItem('email');