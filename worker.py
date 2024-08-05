from rich.console import Console

import time
import requests
import os 

console = Console()

console.log('Starting worker...')


if "TARGET_HOST" in os.environ:
    target_host = os.environ["TARGET_HOST"]
else:
    target_host = 'http://localhost:3000'
    
console.log('Target host: ' + target_host)

while True:
    try: 
        r = requests.post(target_host + '/api/worker')
        time.sleep(1)
    except Exception as e:
        console.log(e)
        time.sleep(10)