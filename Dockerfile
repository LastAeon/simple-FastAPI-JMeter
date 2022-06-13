FROM python:3.9

WORKDIR /app

COPY src/requirements.txt /app/requirements.txt

RUN python3 -m pip install --upgrade pip setuptools wheel                                                                                                                                                                                                
RUN python3 -m pip install -r /app/requirements.txt

EXPOSE 8000

COPY ./src /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
