
function modPowCustom(base, exponent, modulus) {
    base = BigInt(base);
    exponent = BigInt(exponent);
    modulus = BigInt(modulus);

    if (modulus === BigInt(1)) return BigInt(0);
    let result = BigInt(1);
    base = (base % modulus + modulus) % modulus; // Ensure base is non-negative
    while (exponent > 0) {
        if (exponent % BigInt(2) === BigInt(1)) {
            result = (result * base) % modulus;
        }
        exponent = exponent / BigInt(2);
        base = (base * base) % modulus;
    }
    return (result + modulus) % modulus; // Ensure result is non-negative
}
async function calculateHash(Y, T, a) {
    var msg = Y + T + a;
    console.log("msg in calculateHash: ", msg);
    const msgUint8 = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log("hashHex in calculateHash: ", hashHex);
    // hex to integer
    const biBase = BigInt('1');
    const biExponent = BigInt('0x' + hashHex);
    console.log("biExponent in calculateHash: ", biExponent);
    const modulus = "4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794779";
    const biModulus = BigInt(modulus);
    const C = modPowCustom(biExponent,biBase, biModulus);
    return C.toString();
}

function calculateT(r) {
    var p = '4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794779';
    const biModulus = BigInt(p);
    var T = modPowCustom(BigInt(2), BigInt(r), biModulus);
    return T.toString();
}


function generateZ(r, c, x) {
    var p = BigInt('4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794778');
    var cx = BigInt(c) * x;
    // cx = modPowCustom(cx, BigInt(1), p);

    console.log("cx mod p is: ", cx);
    var rcx = (BigInt(r) - cx);  // Add modulus operation to ensure rcx is positive

    console.log("rcx: ", rcx);
    // var aftermod = BigNumber(rcx).mod(p);
    // console.log("aftermod: ", aftermod.valueOf());
    rcx = modPowCustom(rcx, BigInt(1),p);
    // rcx = mod(rcx,p);

    console.log("rcx after modPowCustom: ", rcx);
    return rcx.toString();
}



var hashedPasswordDecimal;
async function generatePublicKey(password, sitename, username) {
    // Concatenate the password, sitename, and username
    const msg = password + sitename + username;

    // Hash the message using SHA-256
    const msgUint8 = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    hashedPasswordDecimal = BigInt('0x' + hashHex);
    // Convert the hash, g, and modulus to BigInt
    const biBase = BigInt('2');
    const biExponent = BigInt('0x' + hashHex);
    const modulus = "4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794779";
    const biModulus = BigInt(modulus);

    // Calculate Y = (biBase ^ biExponent) % biModulus using modular exponentiation
    const Y = modPowCustom(biBase, biExponent, biModulus);


    // Return Y as a string
    return Y.toString();
}




async function login(event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (username.length > 0 && password.length > 0) {


        var r = Math.floor(Math.random() * 100) + 1;
        // r = 90;
        console.log("r: ", r);
        var T = BigInt(calculateT(r));
        var a = document.getElementById('challenge').value;
        var Y = await generatePublicKey(password, 'localhost', username);
        console.log("Y: ", Y);
        console.log("T: ", T);
        var c = await calculateHash(Y, T, a);
        console.log("c: ", c);
        // cx = modPowCustom(cx, BigInt(1), BigInt('4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794779'));
       
        var z = generateZ(r,c,hashedPasswordDecimal);
        console.log("z: ", z);
        var cstring = c.toString();
        var zstring = z.toString();
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'c=' + cstring + '&z=' + zstring + '&username=' + encodeURIComponent(username),
        })
            .then(response => {
                if (response.status==200) {
                    console.log('User logged in successfully');
                    var loginstatus = document.getElementById('loginstatus');
                    loginstatus.innerHTML = 'User logged in successfully';
                    loginstatus.style.color = 'green';
                } else {
                    console.error('User login failed');
                    var loginstatus = document.getElementById('loginstatus');
                    loginstatus.innerHTML = 'User Authentication failed';
                    loginstatus.style.color = 'red';
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