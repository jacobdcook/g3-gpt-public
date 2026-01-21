import unittest
import json

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from time import sleep

class TestHomePage(unittest.TestCase):
    def setUp(self):
        chrome_options = Options()
        chrome_options.add_experimental_option("debuggerAddress", "localhost:9222")

        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 20)

        self.driver.get("http://localhost:3000")
        
    def test_1_chat_session_contains_chats(self):

        recent_chat_button = self.wait.until(EC.element_to_be_clickable((By.ID, "recent-chats-button")))
        recent_chat_button.click()

        sleep(3)

        test_chat = [
            [
                {"type": "user", "text": "Test message"},
                {"type": "bot", "text": "Test response"}
            ]
        ]

        self.driver.execute_script(
            f"window.localStorage.setItem('chatSessions', '{json.dumps(test_chat)}');"
        )
        self.driver.refresh()

        sleep(3)

        chat_element = self.wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "chatSession"))
        )

        # Added those extra periods again...
        if "Test message" in chat_element.text:
            print(".☑️ The test message was found in the chat container!")
        else:
            print(".⚠️ The test message was not found in the chat container...")

        sleep(3)

        if "Test response" in chat_element.text:
            print(".☑️ The test response was found in the chat container!")
        else:
            print(".⚠️ The test response was not found in the chat container...")

        sleep(3)

    def test_2_remove_chat(self):
        remove_button = self.wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "removeButton")))
        remove_button.click()

        empty_chat = self.driver.find_element(By.CLASS_NAME, "noChatsPlaceholder")

        if empty_chat:
            print("☑️ The test chat was cleared!")
        else:
            print("⚠️ The test chat was not cleared...")

        sleep(3)

    def test_3_clear_all_chats(self):
        test_chats = [
            [{"type": "user", "text": "Test 1"}],
            [{"type": "user", "text": "Test 2"}]
        ]

        self.driver.execute_script(
            f"window.localStorage.setItem('chatSessions', '{json.dumps(test_chats)}');"
        )
        self.driver.refresh()

        sleep(3)

        clear_button = self.wait.until(
            EC.element_to_be_clickable((By.ID, "clear-chats-button"))
        )
        clear_button.click()

        sleep(3)
        
        clear_button = self.wait.until(
            EC.element_to_be_clickable((By.ID, "clear-button"))
        )
        clear_button.click()

        sleep(3)

        empty_chat = self.driver.find_element(By.CLASS_NAME, "noChatsPlaceholder")
        
        if empty_chat:
            print("☑️ All chats were cleared!")
        else:
            print("⚠️ The chats were not cleared...")

    def test_4_load_chats(self):
        test_chats = [
            [{"type": "user", "text": "Test 1"}],
            [{"type": "user", "text": "Test 2"}]
        ]

        self.driver.execute_script(
            f"window.localStorage.setItem('chatSessions', '{json.dumps(test_chats)}');"
        )
        self.driver.refresh()

        sleep(3)

        load_button = self.wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "h3[role='button']"))
        )
        load_button.click()

        sleep(3)

        restored_chat = self.driver.find_element(By.ID, "chats-container").text.strip()

        if restored_chat:
            print("☑️ The chat messages have loaded.")
        else:
            print("⚠️ The chat messages were not loaded!")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
