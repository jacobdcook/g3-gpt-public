# install selenium: pip install selenium

# NOTE: to run this test, see HowToRunDocsTest.md

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options

import os
import unittest
from time import sleep

test_doc_path = os.path.join(os.path.dirname(__file__), "test_docs_page-test_doc.txt")
print(test_doc_path)


class TestDocumentsPage(unittest.TestCase):
    def setUp(self):
        chrome_options = Options()
        chrome_options.add_experimental_option("debuggerAddress", "localhost:9222")

        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 20)

        self.driver.get("http://localhost:3000")

    def try_select_file_from_home(self):
        mydocs_button = self.wait.until(
            EC.element_to_be_clickable((By.ID, "my-docs-button"))
        )
        mydocs_button.click()

        upload_button = self.wait.until(
            EC.element_to_be_clickable((By.CLASS_NAME, "uploadButton"))
        )
        upload_button.click()

        sleep(3)

        # select file
        file_input = self.driver.find_element(By.XPATH, "//input[@type='file']")
        file_input.send_keys(test_doc_path)

    def recv_prompt_res_from_mydocs(self):
        new_chat_button = self.wait.until(
            EC.element_to_be_clickable((By.ID, "new-chat-button"))
        )
        new_chat_button.click()

        sleep(1)
        input_box = self.wait.until(EC.element_to_be_clickable((By.ID, "chat-input")))
        input_box.send_keys(
            'What is code kneading? IMPORTANT: 1) if you don\'t have an answer, respond exactly with "NO RESPONSE", and 2) Do not use markdown.'
        )
        input_box.send_keys(Keys.ENTER)

        response_parent = self.wait.until(
            EC.presence_of_element_located((By.NAME, "ai-msg"))
        )
        return response_parent.find_element(By.XPATH, "./child::*")

    def test_document_page(self):
        wait = self.wait

        try:
            sso_button = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[text()='SSO Azure Login']")
                )
            )
            sso_button.click()
        except Exception:
            print("Didn't find SSO Azure Login button, checking for My Documents")

        self.try_select_file_from_home()

        wait.until(
            EC.text_to_be_present_in_element(
                (By.NAME, "fileSelectFeedback"), "Valid file"
            )
        )

        print("✅ File passed validity check")

        all_roles_chk = wait.until(EC.element_to_be_clickable((By.NAME, "selectAll")))
        all_roles_chk.click()

        sleep(2)

        upload_button = wait.until(
            EC.element_to_be_clickable((By.CLASS_NAME, "saveButton"))
        )
        upload_button.click()

        print("🆙 Uploading file")

        sleep(1)

        response = self.recv_prompt_res_from_mydocs()

        print(response)

        if response.text == "NO RESPONSE":
            print(
                "⚠️ No response generated despite available information. Possibly simply due to LLM unpredictability; investigate if persistent."
            )
        else:
            print(
                f"☑️ Received response. The LLM should have provided be a descriptive answer: {response.text[0:9]}..."
            )

        self.try_select_file_from_home()

        warning = wait.until(
            EC.visibility_of_element_located((By.CLASS_NAME, "docPageWarning"))
        )

        self.assertIn("Please rename the file", warning.text)

        print("✅ File failed validity check as expected")

        sleep(2)

        cancel_button = wait.until(
            EC.element_to_be_clickable((By.CLASS_NAME, "cancelButton"))
        )
        cancel_button.click()

        recents_button = wait.until(
            EC.element_to_be_clickable((By.ID, "recent-chats-button"))
        )
        recents_button.click()

        sleep(8)

        docs_button = wait.until(EC.element_to_be_clickable((By.ID, "my-docs-button")))
        docs_button.click()

        remove_button = wait.until(
            EC.element_to_be_clickable(
                (By.ID, "remove-btn-test_docs_page-test_doc.txt")
            )
        )
        remove_button.click()

        remove_confirm_button = wait.until(
            EC.element_to_be_clickable((By.ID, "remove-confirm-button"))
        )
        sleep(1)
        remove_confirm_button.click()

        print("🗑️ Removing file.")

        sleep(3)

        response = self.recv_prompt_res_from_mydocs()

        if response.text != "NO RESPONSE":
            print(
                '⚠️ The LLM should not have had sufficient context but did not respond with "NO RESPONSE". Possibly simply due to LLM unpredictability; investigate if persistent.'
            )
        else:
            print("✅ Received appropriate response")


if __name__ == "__main__":
    unittest.main()
