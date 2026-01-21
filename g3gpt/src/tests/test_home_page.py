# NOTE: to run this test, see HowToRunDocsTest.md

import unittest

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
        
    def test_1_chat_functions(self):
        sleep(3)
        
        new_chat_button = self.wait.until(
            EC.element_to_be_clickable((By.ID, "new-chat-button"))
        )
        new_chat_button.click()

        chat_box = self.wait.until(EC.element_to_be_clickable((By.ID, "chat-input")))
        chat_box.send_keys('This is a test prompt. IMPORTANT: 1) Respond exactly with "Thank you for testing!", and 2) Do not use markdown.')
        chat_box.send_keys(Keys.ENTER)

        response = self.wait.until(EC.presence_of_element_located((By.NAME, "ai-msg")))

        # Added a period at the beginning of the string because it was driving me crazy that they weren't aligned
        if response.text == "Thank you for testing!":
            print(f".☑️ Received response. {response.text}")
        else:
            print(".⚠️ Response may have been received, but not the expected outcome. Please ensure G3GPT is online.")
        
        sleep(3)

    def test_2_new_chat(self):
        new_chat_button = self.wait.until(EC.element_to_be_clickable((By.ID, "new-chat-button")))
        new_chat_button.click()

        empty_chat = self.driver.find_element(By.ID, "chats-container").text.strip()

        if not empty_chat:
            print("☑️ New chat container started.")
        else:
            print("⚠️ The chat container has not been cleared.")

        sleep(3)

    def test_3_navigation(self):
        current_page = self.driver.current_url

        recent_chat_button = self.wait.until(EC.element_to_be_clickable((By.ID, "recent-chats-button")))
        recent_chat_button.click()

        sleep(3)

        home_button = self.wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "goBackButton")))
        home_button.click()

        if current_page.endswith('/home'):
            print("☑️ You're back home!")
        else:
            print("⚠️ Uh oh, you seem to be lost!")
        
        sleep(3)
        
        my_docs_button = self.wait.until(EC.element_to_be_clickable((By.ID, "my-docs-button")))
        my_docs_button.click()

        sleep(3)

        home_button = self.wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "goBackButton")))
        home_button.click()

        # Added a period...
        if current_page.endswith('/home'):
            print(".☑️ You're back home!")
        else:
            print("⚠️ Uh oh, you seem to be lost!")

        sleep(3)
        
        questions_button = self.wait.until(EC.element_to_be_clickable((By.ID, "questions-button")))
        questions_button.click()

        sleep(3)

        new_chat_button = self.wait.until(EC.element_to_be_clickable((By.ID, "new-chat-button")))
        new_chat_button.click()

        # And again...
        if current_page.endswith('/home'):
            print(".☑️ You've started a new chat!")
        else:
            print("⚠️ Uh oh, you seem to be lost!")

        sleep(3)

        

    def test_4_msg_retention_on_redirection(self):

        chat_box = self.wait.until(EC.element_to_be_clickable((By.ID, "chat-input")))
        chat_box.send_keys('This is a test prompt.')
        chat_box.send_keys(Keys.ENTER)

        self.wait.until(EC.presence_of_element_located((By.NAME, "ai-msg")))

        sleep(3)

        recent_chat_button = self.wait.until(EC.element_to_be_clickable((By.ID, "recent-chats-button")))
        recent_chat_button.click()

        sleep(3)

        home_button = self.wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "goBackButton")))
        home_button.click()

        restored_chat = self.driver.find_element(By.ID, "chats-container").text.strip()

        if restored_chat:
            print("☑️ The chat messages have persisted.")
        else:
            print("⚠️ The chat container was cleared!")

        sleep(3)

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
