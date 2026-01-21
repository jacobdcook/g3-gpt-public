import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

class MyDocumentsTest(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        self.wait = WebDriverWait(self.driver, 10)
    
    # Helper method to count scrollbars
    def count_scrollbars(self):
        driver = self.driver
        
        # Check if the main container has a scrollbar
        main_container = driver.find_element(By.CSS_SELECTOR, ".mainContainer")
        main_scrollable = driver.execute_script("return arguments[0].scrollHeight > arguments[0].clientHeight;", main_container)
        
        # Check if the documents container has a scrollbar
        docs_container = driver.find_element(By.CSS_SELECTOR, ".docsContainer")
        docs_container_scrollable = driver.execute_script("return arguments[0].scrollHeight > arguments[0].clientHeight;", docs_container)
        
        return main_scrollable, docs_container_scrollable

    # Test Case 1: Checks if clicking "Upload File" button opens the FileUploadPrompt 
    def test_upload_button_opens_prompt(self):
        driver = self.driver
        wait = self.wait
        continue_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Continue']")))
        continue_button.click()
        
        # wait for document button to load
        doc_mgmt_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Documents')]")))
        doc_mgmt_button.click()

        # clicks on the Upload button and wait for the prompt to appear
        upload_button = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "uploadButton")))
        self.driver.execute_script("arguments[0].scrollIntoView();", upload_button)  # Scroll upload button into view
        upload_button.click()

        # Will check if the Save button in the Upload File prompt is shown
        try:
            save_button = wait.until(EC.visibility_of_element_located((By.XPATH, "//button[text()='Save']")))
            self.assertTrue(save_button.is_displayed(), "Upload prompt did not appear after clicking the upload button.")
        except Exception as e:
            self.fail(f"Failed to open upload prompt: {str(e)}")
    
    # Test Case 2: Tests sorting dropdown functionality
    def test_sorting_dropdown(self):
        driver = self.driver
        wait = self.wait

        continue_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Continue']")))
        continue_button.click()
        doc_mgmt_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Documents')]")))
        doc_mgmt_button.click()

        # Helper function to fetch document names for sorting test
        def fetch_document_names():
            return [doc.text for doc in driver.find_elements(By.CSS_SELECTOR, ".docLink")]

        sort_dropdown = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "sortSelect")))
        Select(sort_dropdown).select_by_visible_text("Most Recent")
        
        wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".docItem")))  
        recent_docs = fetch_document_names()
        
        # Debugging: Print the document order to verify sorting
        print("Expected Recent Order:", sorted(recent_docs, reverse=True))
        print("Actual Recent Order:", recent_docs)

        self.assertEqual(recent_docs, sorted(recent_docs, reverse=True), "Documents are not sorted by most recent.")

     # Test Case 3: Testing for RAG 140 - only one scroll bar appears on My Documents page
    def test_single_scrollbar_after_upload(self):
        driver = self.driver
        wait = self.wait

        continue_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Continue']")))
        continue_button.click()
        doc_mgmt_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Documents')]")))
        doc_mgmt_button.click()

        upload_button = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "uploadButton")))
        self.driver.execute_script("arguments[0].scrollIntoView();", upload_button)
        for _ in range(5):
            upload_button.click()
            file_input = driver.find_element(By.XPATH, "//input[@type='file']")
            file_input.send_keys("C:\\Users\\ggise\\Downloads\\sample_file.txt")
            time.sleep(1)

        main_scrollable, docs_container_scrollable = self.count_scrollbars()
        self.assertTrue(main_scrollable, "Main container should have a scrollbar after multiple uploads.")
        self.assertFalse(docs_container_scrollable, "Docs container should not have a scrollbar.")
    
    # Test Case 4: Testing for RAG 141 - zooming feature
    def test_single_scrollbar_on_zoom(self):
        driver = self.driver
        wait = self.wait

        continue_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Continue']")))
        continue_button.click()
        doc_mgmt_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Documents')]")))
        doc_mgmt_button.click()

        # Zoom in using JavaScript for consistency
        driver.execute_script("document.body.style.zoom='125%'")  # Adjust zoom as needed

        main_scrollable, docs_container_scrollable = self.count_scrollbars()
        self.assertTrue(main_scrollable, "Main container should have a scrollbar after zooming.")
        self.assertFalse(docs_container_scrollable, "Docs container should not have a scrollbar.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
