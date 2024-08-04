import time
import requests

while True:
    try: 
        r = requests.post('http://localhost:3000/api/worker')
        time.sleep(1)
        print(r.json())
    except Exception as e:
        print(e)
        time.sleep(10)