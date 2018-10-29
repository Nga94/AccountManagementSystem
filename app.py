from flask import Flask, url_for, render_template, request, jsonify
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from connectdb import mydb
import ast

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
jwt = JWTManager(app)


# @app.route('/')
# def index():
#     return 'index'

@app.route('/login', methods=['GET', 'POST'])
def login():
    global mydb
    if request.method == 'GET':
        return render_template("html/login.html")
    #print request.data
    jsondata = ast.literal_eval(request.data)
    username = jsondata['uname']
    print(username)
    access_token = create_access_token(identity=username)
    #print(access_token)
    accounts = mydb['accounts']
    if accounts.find({'firstname': username}).count() > 0:
        return jsonify(username=username, token=access_token)
    return "LOGIN fail"


@app.route('/user')
@jwt_required
def profile():
    current_user = get_jwt_identity()
    print current_user
    return render_template("html/profile.html", name="NGA")

if __name__ == '__main__':
    app.run(debug=True)