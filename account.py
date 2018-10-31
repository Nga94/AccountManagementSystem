class Account:
    def __init__(self, account_number, firstname, lastname, age, address, gender, email, city, employer, state, balance):
        self.account_number = account_number
        self.firstname = firstname
        self.lastname = lastname
        self.age = age
        self.address = address
        self.gender = gender
        self.email = email
        self.city = city
        self.employer = employer
        self.state = state
        self.balance = balance
    def tojson(self):
        return {'account_number': self.account_number, 'firstname' : self.firstname, 'lastname' : self.lastname,
                'age' : self.age, 'address' : self.address, 'gender' : self.gender, 'email' : self.email,
                'city' : self.city, 'employer' : self.employer, 'state' : self.state, 'balance' : self.balance}