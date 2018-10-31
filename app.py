from flask import Flask, url_for, render_template, request, jsonify
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from connectdb import mydb
from account import Account
import ast

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
jwt = JWTManager(app)


# @app.route('/')
# def index():
#     return 'index'

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/login', methods=['POST'])
def login():
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


@app.route('/getall', methods=['GET', 'POST'])
@jwt_required
def getall():

    acctbl = mydb.accounts
    accounts = acctbl.find()
    rs = []
    for i in accounts:
        acc = Account(i["account_number"], i["firstname"], i["lastname"], i["age"], i["address"],
                      i["gender"], i["email"], i["city"], i["employer"], i["state"], i["balance"])
        rs.append(acc)
    return jsonify({
        "data": [x.tojson() for x in rs]
    }), 200

@app.route('/insert', methods=['POST'])
@jwt_required
def insert():
    data = request.json.get("account")
    acc = Account(data["account_number"], data["firstname"], data["lastname"], data["age"], data["address"],
                      data["gender"], data["email"], data["city"], data["employer"], data["state"], data["balance"])
    acctbl = mydb.accounts
    result = acctbl.insert(acc.tojson())
    if result:
        return jsonify({"msg": "insert successfully"})
    else:
        return jsonify({"msg": "insert failed"})

@app.route('/update/<id>', methods=['PUT'])
@jwt_required
def update(id):
    data = request.json.get("account")
    acc = Account(data["account_number"], data["firstname"], data["lastname"], data["age"], data["address"],
                      data["gender"], data["email"], data["city"], data["employer"], data["state"], data["balance"])
    acctbl = mydb.accounts
    result = acctbl.update_one({"account_number": int(id)}, {"$set": acc.tojson()})
    if result.matched_count == 1:
        return jsonify({"msg": "update successfully"})
    else:
        return jsonify({"msg": "update failed"})

@app.route("/delete/<id>", methods=["DELETE"])
@jwt_required
def delete(id):
        acctbl = mydb.accounts
        result = acctbl.delete_one({"account_number": int(id)})
        if result.deleted_count == 1:
            return jsonify({"msg": "delete successfully"}), 200
        else:
            return jsonify({"msg": "delete failed"}), 400


if __name__ == '__main__':
    app.run(debug=True)