# load-test for FastAPI
## how to run
1. copy file ".dbconfig.example" as ".dbconfig"
2. create postgre database
3. fill .dbconfig with your database configuration
4. create and use venv (optional)
5. install requirement from requirements.txt
6. run server with command:
```
uvicorn main:app --reload
```

## database
1. database 1 table which is "items" table
2. items table have 3 column which is id, name, and quantity
3. column id is auto incrementing and can't be set/changed from API

## API
API documentation can be seen at url server/docs. default url is http://127.0.0.1:8000/docs