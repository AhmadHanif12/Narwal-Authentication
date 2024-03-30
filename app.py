from flask import Flask
from flask import render_template, redirect, url_for,request
from flask_sqlalchemy import SQLAlchemy
from model import User,db
from crypto import generate_group,generate_Tnot
from flask import jsonify,session
from flask_login import LoginManager
import random
import os
import hashlib




def create_app():
    app = Flask(__name__)
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///narwhal.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    app.debug = True
    os.environ['FLASK_ENV'] = 'development'  # Set FLASK_ENV to development
    return app

app = create_app()
app.secret_key = 'this is very much a secret key'
def create_tables():
    db.create_all()

with app.app_context():
    create_tables()

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login',methods=['GET','POST'])
def login():
    print("Login page\n\n\n")
    if request.method == 'POST':
        username = request.form['username']
        user = User.query.filter_by(username=username).first()
        print(user,"PoST REQUEST RECEIVED\n\n\n")
        if user:    
            # print the body of received request
            c = request.form['c']
            z = request.form['z']
            print('c:', c)
            print('z:', z)
            p = '4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794779'

            y = User.query.filter_by(username=username).first().public_key
            


            # Yc = pow(int(y), int(c), int(p))
            # Tnot = Yc * pow(2, int(z),int(p))
            Tnot = generate_Tnot(int(y), int(c), int(z))
            print('Tnot:', Tnot)
            # print('Yc:', Yc)
            # print('Gz:', pow(2, int(z),int(p)))
            msg = str(y) + str(Tnot) + str(session['a'])
            print('msg:', msg)
            hash_object = hashlib.sha256(msg.encode())
            hash_hex = hash_object.hexdigest()
            hashed_password_decimal = int(hash_hex, 16)
            print ('confirmation:', hashed_password_decimal)
            # Store a and username in session for later verification
            if int(c) == int(hashed_password_decimal):
                print('Login successful')
                return jsonify({'message': 'Logged in Successful'}), 200
            else:
                print('Login failed')
                return jsonify({'message': 'Login failed'}), 401
        else:
            return 'User does not exist'
    else:
        a = random.randint(1,100)
        # a = 20
        session['a'] = a 
        return render_template('login.html',a=a)
 
@app.route('/register',methods=['GET','POST'])
def register():
    # check if there's username and public key  
    if request.method == 'POST':
        username = request.form['username']
        user = User.query.filter_by(username=username).first()
        if user:
            return jsonify({'message':'User already exists'}),400

        # body: 'username=' + encodeURIComponent(username) + '&Y=' + encodeURIComponent(Y),
        public_key = request.form['Y']
        print(public_key,username)
        user = User(username=username,public_key=public_key)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message':'User created successfully'}),200
    else:
        group = generate_group()
        print("staying here for too long")
        return render_template('register.html',group = group)


@app.route('/check_username',methods=['POST'])
def check_username():
    username = request.form['username']
    user = User.query.filter_by(username=username).first()
    data = {}
    if user:
        data['username_exits'] = True
    else:
        data['username_exits'] = False
    return jsonify(data)

if __name__ == '__main__':
   app.run(debug=True)