import os
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import dh


def generate_Tnot(Y, c, z):
    """Generates Tnot based on Y, c, and z."""
    p = 4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794779
    Yc = pow(Y, c, p)
    Tnot = pow((Yc * pow(2, z, p)),1,p)
    return Tnot

def generate_group():
    # Generate a safe prime for DH group (you should choose an appropriate size for actual use)
    # 2048 bits is generally considered secure as of my last update in April 2023
    parameters = dh.generate_parameters(generator=2, key_size=512, backend=default_backend())

    # Generate the public and private keys
    private_key = parameters.generate_private_key()
    public_key = private_key.public_key()

    # Obtain the parameters
    p = parameters.parameter_numbers().p
    g = parameters.parameter_numbers().g

    # For your group, you could use the modulus p and generator g
    group = {'p':p,'g': g}

    # g_0 could be the public key, but since we're just setting up the group, it's not needed here
    # If you need to generate a specific g_0 for your implementation, add that logic here
    return group

group = generate_group()

print(group)
