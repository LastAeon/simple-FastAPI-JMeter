# main code/ routing
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session

import model, schema
from database import SessionLocal, engine


model.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def hello_world():
    return "Hello World"

@app.get("/item", response_model=list[schema.Item])
def get_all_item(db: Session = Depends(get_db)):
    return db.query(model.Item).all()

@app.get("/item/{item_id}", response_model=schema.Item)
def get_item(item_id, db: Session = Depends(get_db)):
    return db.query(model.Item).filter(model.Item.id == item_id).first()

@app.post("/item", response_model=schema.Item, status_code=201)
def create_item(item:schema.ItemData, db: Session = Depends(get_db)):
    new_item = model.Item(
        name = item.name,
        quantity = item.quantity
    )
    db.add(new_item)
    db.commit()
    return new_item

@app.put("/item/{item_id}", response_model=schema.Item)
def update_item(item_id, item:schema.ItemData, db: Session = Depends(get_db)):
    item_to_update = db.query(model.Item).filter(model.Item.id == item_id).first()
    item_to_update.name = item.name
    item_to_update.quantity = item.quantity

    db.commit()
    return item_to_update

@app.delete("/item/{item_id}", response_model=schema.Item)
def delete_item(item_id, db: Session = Depends(get_db)):
    item_to_delete = db.query(model.Item).filter(model.Item.id == item_id).first()
    if item_to_delete is None:
        raise HTTPException(status_code=404, detail="Resource Not Found")
    db.delete(item_to_delete)
    db.commit()
    return item_to_delete


