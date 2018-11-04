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
jwt = JWTManager(app)


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
        userTbl = mydb.user
        cur_user = get_jwt_identity()
        usercur = userTbl.find({"username": cur_user})
        if usercur.count() > 0:
            for u in usercur:
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
    columns = ["account_number", "firstname", "lastname", "gender", "age", "email", "address", "city", "state",
               "employer", "balance"]
    _filter = {}
    if param.get("search") != "":
        # the term put into search is logically concatenated with 'or' between all columns
        or_filter_on_all_columns = []

        for i in range(len(columns)):
            column_filter = {}
            # case insensitive partial string matching pulled from user input
            column_filter[columns[i]] = {'$regex': param.get("search"), '$options': 'i'}
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
    if result:
        return jsonify({"msg": "insert successfully"})
    else:
        return jsonify({"msg": "insert failed"})

@app.route('/update/<id>', methods=['PUT'])
@jwt_required
@checkadmin
def update(id):
    data = request.json.get("account")
    acctbl = mydb.accounts
    result = acctbl.update_one({"account_number": int(id)}, {"$set": tojsonAccount(data)})
    if result.matched_count == 1:
        return jsonify({"msg": "update successfully"})
    else:
        return jsonify({"msg": "update failed"})

@app.route("/delete/<id>", methods=["DELETE"])
@jwt_required
@checkadmin
def delete(id):
        acctbl = mydb.accounts
        result = acctbl.delete_one({"account_number": int(id)})
        if result.deleted_count == 1:
            return jsonify({"msg": "delete successfully"}), 200
        else:
            return jsonify({"msg": "delete failed"}), 400

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


if __name__ == '__main__':
    app.run(debug=True)
