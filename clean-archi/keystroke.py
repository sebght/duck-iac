import time
import random
from pynput.keyboard import Key, Controller

keyboard = Controller() 

def type_string_with_delay(array):
    while true:
        for move in array:  
            keyboard.press(move)
            keyboard.release(move)  
            time.sleep(1)

array = [Key.up, Key.right, Key.down, Key.left]
type_string_with_delay(array)