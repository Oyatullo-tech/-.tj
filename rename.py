import os
import time

try:
    os.chdir('..')
    time.sleep(1)
    os.rename('Чернович', 'чернович2')
    os.rename('чернович2', 'чернович')
    print("Success")
except Exception as e:
    print("Error:", e)
