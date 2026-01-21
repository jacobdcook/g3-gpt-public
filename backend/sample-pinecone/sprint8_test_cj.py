from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import unittest
import time

class DocumentManagementTest(unittest.TestCase):
    def setUp(self):
        # Initialize the Chrome WebDriver and open the local application
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")

    def test_document_management_flow(self):
        driver = self.driver

        # Waits for elements to load and interacts as described
        wait = WebDriverWait(driver, 20)

        # Step 1: Press the "Continue" button
        continue_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Continue']")))
        continue_button.click()

        time.sleep(3)

        # Step 2: Press the "Document Management" button
        doc_mgmt_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Documents')]")))
        doc_mgmt_button.click()


        time.sleep(3)

        # Step 3: Upload "file.txt"
        file_input = driver.find_element(By.XPATH, "//input[@type='file']")
        file_input.send_keys("c:\\Users\\CJBrian Nocon\\Downloads\\example-data\\uploaded\\Island conquest 12-31.pdf")  # Update this with the correct path to file.txt

        time.sleep(3)

        # Step 4: Select "HR" checkbox
        hr_checkbox = wait.until(EC.element_to_be_clickable((By.NAME, "HR")))
        hr_checkbox.click()

        time.sleep(3)

        # Step 5: Press the "Save" button
        save_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Save']")))
        save_button.click()

        time.sleep(3)

        # Step 6: Press the "Go Back" button
        go_back_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Go Back']")))
        go_back_button.click()

        time.sleep(3)

        # Step 7: Enter "Tell me about file" in the chat box and send the prompt
        chat_box = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Hello! How can I help you?']")))
        chat_box.send_keys("Tell me about Island Conquest.")
        chat_box.send_keys(Keys.RETURN)  # Press Enter to send the message

        time.sleep(3)

        # Step 8: Retrieve and print the response result
        response_element = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[@class='msg-container bot']//p[contains(text(), 'You do not have access to this information.')]")))
        # Retrieve and print the response text
        response_text = response_element.text
        print("Bot Response:", response_text)

    def tearDown(self):
        # Close the browser after test
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
