from flask import Flask, url_for, render_template, request, jsonify
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from connectdb import mydb
from functools import wraps

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
jwt = JWTManager(app)
blacklist = set()

@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    return jti in blacklist

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/bankacc")
def abbankaccc():
    return render_template("bankacc.html")


@app.route("/login")
def login():
    return render_template("login.html")

def tojsonAccount(account):
    return {'account_number': account["account_number"], 
            'firstname' : account["firstname"], 
            'lastname' : account["lastname"],
            'age' : account["age"],
            'address' : account["address"],
            'gender' : account["gender"],
            'email' : account["email"],
            'city' : account["city"], 
            'employer' : account["employer"], 
            'state' : account["state"], 
            'balance' : account["balance"]
        }

# check if user send request is admin
def checkadmin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        userTbl = mydb.users
        cur_user = get_jwt_identity()
        usercur = userTbl.find_one({"username": cur_user})
        if usercur:
            if u["role"] == 0:
                return jsonify({"msg": "just admin can perform this action"}), 400
        return f(*args, **kwargs)

    return wrapper

@app.route('/checklogin', methods=['POST'])
def checklogin():
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
    users = mydb['users']
    user_curren = users.find({"username": username}, {"password": password})
    # check data return is empty
    if user_curren.count() == 0:
        return jsonify({"msg": "Username or password is incorrect"}), 400
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200


@app.route('/getall', methods=['GET', 'POST'])
@jwt_required
def getall():
    param = request.json
    offset = param.get("from")
    size = param.get("size")
    acctbl = mydb.accounts
    totalrecord = acctbl.find().count()
    columns = ["account_number", "firstname", "lastname", "gender", "age", 
    "email", "address", "city", "state", "employer", "balance"]
    _filter = {}
    if param.get("search") != "":
        # the term put into search is logically concatenated with 'or' between all columns
        or_filter_on_all_columns = []

        for col in columns:
            column_filter = {}
            column_filter[col] = {'$regex': param.get("search"), '$options': 'i'}
            or_filter_on_all_columns.append(column_filter)

        _filter['$or'] = or_filter_on_all_columns
    accounts = acctbl.find(_filter).skip(offset).limit(size)
    recordsFiltered = acctbl.find(_filter).count()
    rs = []
    for i in accounts:
        acc = tojsonAccount(i)
        rs.append(acc)
    return jsonify({
        "data": [ x for x in rs],
        "recordsTotal": totalrecord,
        "recordsFiltered": recordsFiltered,

    }), 200

@app.route('/insert', methods=['POST'])
@jwt_required
@checkadmin
def insert():
    data = request.json.get("account")
    acctbl = mydb.accounts
    result = acctbl.insert(tojsonAccount(data))
    return jsonify({"msg": "insert successfully"})

@app.route('/update/<id>', methods=['PUT'])
@jwt_required
@checkadmin
def update(id):
    data = request.json.get("account")
    acctbl = mydb.accounts
    result = acctbl.update({"account_number": int(id)}, {"$set": tojsonAccount(data)})
    return jsonify({"msg": "update successfully"})

@app.route("/delete/<id>", methods=["DELETE"])
@jwt_required
@checkadmin
def delete(id):
        acctbl = mydb.accounts
        result = acctbl.remove({"account_number": int(id)})
        return jsonify({"msg": "delete successfully"}), 200

@app.route("/detail/<id>", methods=["GET"])
@jwt_required
def detail(id):
    acctbl = mydb.accounts
    accounts = acctbl.find({"account_number": int(id)})
    rs = []
    for i in accounts:
        acc = tojsonAccount(i)
        rs.append(acc)
    return jsonify({
        "data": [x for x in rs],
        "size": len(rs),
        "msg": "get data successed"
    }), 200

@app.route("/user", methods=["GET"])
@jwt_required
def get_user():
    userTbl = mydb.users
    cur_user = get_jwt_identity()
    usercur = userTbl.find_one({"username": cur_user})
    return jsonify({"user": {"username": usercur["username"], "role": usercur["role"]}})

    # Endpoint for revoking the current users refresh token
@app.route('/logout', methods=['FET'])
@jwt_required
def logout():
    jti = get_raw_jwt()['jti']
    blacklist.add(jti)
    return jsonify({"msg": "Successfully logged out"}), 200

if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
