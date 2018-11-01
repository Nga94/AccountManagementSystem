from flask import Flask, url_for, render_template, request, jsonify
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from connectdb import mydb
import ast
from flask_cors import CORS

app = Flask(__name__)
#allow request from client
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Setup the Flask-JWT-Extended extension
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
jwt = JWTManager(app)


# @app.route('/')
# def index():
#     return 'index'

@app.route('/api/authenticate', methods=['POST'])
def login():
    global mydb
    # check if request has json data
    if not request.is_json:
        return jsonify({"msg": "Missing JSON data in request"}), 400
    # get username from request
    username = request.json.get("username")
    # get password from request
    password = request.json.get("password")

    # check username is empty
    if not username:
        return jsonify({"msg": "Missing username in request"}), 400
    # check password is empty
    if not password:
        return jsonify({"msg": "Missing password in request"}), 400
    # get date in accounts with filter  
    accounts = mydb['accounts']
    usercurren = accounts.find({"firstname": username})
    # check data return is empty
    if usercurren.count() == 0:
        return jsonify({"msg": "Username or password is incorrect"}), 400
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200


@app.route('/api/getuser')
@jwt_required
def profile():
    current_user = get_jwt_identity()
    return jsonify(name=current_user), 200


if __name__ == '__main__':
    app.run(debug=True)