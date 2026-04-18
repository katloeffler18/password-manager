from flask_login import UserMixin

class User(UserMixin):
    # Pull all this data from the db once it is setup
    id = None 
    username = None
    email = None
    password_hash = None