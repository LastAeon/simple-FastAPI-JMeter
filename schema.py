# creating database schema(pydantic)
from pydantic import BaseModel


class ItemData(BaseModel):
    name: str
    quantity: int
    

class Item(ItemData):
    id: int

    class Config:
        orm_mode = True