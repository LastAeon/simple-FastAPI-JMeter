# create database connection
import configparser
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

config = configparser.ConfigParser()
config.read(".dbconfig")
config = config['DB']

SQLALCHEMY_DATABASE_URL = "{}://{}:{}@{}/{}".format(config['type'],config['username'],config['password'],config['server'],config['name'])
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()