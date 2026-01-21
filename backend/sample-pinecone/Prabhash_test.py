import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


service = Service(ChromeDriverManager().install())
options = Options()
driver = webdriver.Chrome(service=service, options=options)


def logout_and_cancel():
    """Function to log out and click cancel on the logout dialog"""
    try:

        time.sleep(2)
        logout_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "logoutBtn"))
        )
        logout_button.click()

        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "logout-dialog"))
        )

        time.sleep(2)

        cancel_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Cancel')]")
            )
        )
        cancel_button.click()

        print("Logout dialog cancelled successfully.")

    except Exception as e:
        print(f"Error during logout and cancel: {e}")


def navigate_and_test(url):
    """Function to navigate to a page, log out, cancel the dialog, and then switch to the next page"""
    try:

        driver.get(url)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        print(f"Navigated to {url}")

        time.sleep(3)  # Delay of 3 seconds before performing logout and cancel

        logout_and_cancel()

        time.sleep(3)  # Delay of 3 seconds before moving to the next page

    except Exception as e:
        print(f"Error during page test for {url}: {e}")


# tests
try:
    # homepage
    driver.get("http://localhost:3000/home")  # Directly navigate to the homepage

    navigate_and_test("http://localhost:3000/home")  # Homepage URL

    # Recent Page
    navigate_and_test("http://localhost:3000/recents")

    # Questions Page
    navigate_and_test("http://localhost:3000/questions")

finally:
    # Close
    driver.quit()
