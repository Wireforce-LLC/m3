FROM python:3.9 

WORKDIR /app

RUN pip install requests python-dotenv

ADD worker.py main.py

CMD ["python", "/app/main.py"] 
