

var g0 = 0;
function checkUsername() {
    var username = document.getElementById('username').value;
    // console.log(username);
    // console.log(username.length);
    if (username.length > 0) {
        if (username.length < 4) {
            field = document.getElementById('username_error');
            field.style.color = 'black';
            field.innerHTML = 'Username must be at least 4 characters long';
            return;
        }

        fetch('/check_username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'username=' + encodeURIComponent(username),
        })
            .then(data => {
                if (data.username_exists) {
                    afield = document.getElementById('username_error');

                    field.innerHTML = 'Username already exists. Please choose another username.';
                } else {

                    field = document.getElementById('username_error');
                    field.style.color = 'green';
                    field.innerHTML = 'Username is available';
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }
    else {
        field = document.getElementById('username_error');

        field.innerHTML = 'This field is required';
        field.style.color = 'red';
    }

}

function checkPassword() {
    var password = document.getElementById('password').value;
    var field = document.getElementById('password_error');
    if (field) {
        if (password.length > 0) {
            if (password.length < 8) {
                field.innerHTML = 'Password must be at least 8 characters long';
                field.style.color = 'black';
                return;
            }
            field.innerHTML = 'Password is valid';
            field.style.color = 'green';
        }
        else {
            field.innerHTML = 'This field is required';
            field.style.color = 'red';
        }
    } else {
        console.error('Element with id "password_error" not found');
    }
}

function checkConfirmPassword() {
    var passwordField = document.getElementById('password');
    var confirmPasswordField = document.getElementById('confirm-password');
    var errorField = document.getElementById('confirm_password_error');

    errorField.innerHTML = '';
    if (!passwordField || !confirmPasswordField) {
        console.error('One or more elements not found');
        return;
    }

    var password = passwordField.value;
    var confirmPassword = confirmPasswordField.value;

    if (!password) {
        errorField.innerHTML = 'Please enter password first';
        errorField.style.color = 'red';
        return;
    }
    if (confirmPassword.length > 0) {
        if (password !== confirmPassword) {
            errorField.innerHTML = 'Passwords do not match';
            errorField.style.color = 'red';
            return;
        }
        errorField.innerHTML = 'Passwords match';
        errorField.style.color = 'green';
    }
    else {
        errorField.innerHTML = 'This field is required';
        errorField.style.color = 'red';
    }
}




function modPow(base, exponent, modulus) {
    if (modulus === BigInt(1)) return BigInt(0);
    let result = BigInt(1);
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % BigInt(2) === BigInt(1)) {  // If exponent is odd
            result = (result * base) % modulus;
        }
        exponent = exponent >> BigInt(1);  // Equivalent to: exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }
    return result;
}


async function generatePublicKey(password, sitename, username) {
    // Concatenate the password, sitename, and username
    const msg = password + sitename + username;

    // Hash the message using SHA-256
    const msgUint8 = new TextEncoder().encode(msg);                                  
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); 

    // Convert the hash, g, and modulus to BigInt
    const biBase = BigInt('2');
    const biExponent = BigInt('0x' + hashHex);
    const modulus = "4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794779";
    const biModulus = BigInt(modulus);

    // Calculate Y = (biBase ^ biExponent) % biModulus using modular exponentiation
    const Y = modPow(biBase, biExponent, biModulus);


    // Return Y as a string
    return Y.toString();
}





// Create a function that takes the password, hashes it, calculates a value Y=g^X mod p, and sends usernama and Y to the server
async function register(event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var field = document.getElementById('register_error');
    console.log(username, password);
    if (username.length > 0 && password.length > 0) {
        var Y = await generatePublicKey(password, 'localhost', username);
        sessionStorage.setItem('Y', Y);
        console.log(username, Y);
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'username=' + encodeURIComponent(username) + '&Y=' + encodeURIComponent(Y),
        })
            .then(response => {
                if (response.ok) {
                    console.log('User registered successfully');
                    window.location.href = '/login';
                } else {
                    console.error('User registration failed');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        field.innerHTML = 'All fields are required';
        field.style.color = 'red';
    }
}
