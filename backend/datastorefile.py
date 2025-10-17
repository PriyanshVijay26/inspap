from flask_security import SQLAlchemyUserDatastore
from models import db, User, Role

# Initialize the SQLAlchemyUserDatastore with the models
datastore = SQLAlchemyUserDatastore(db, User, Role)
