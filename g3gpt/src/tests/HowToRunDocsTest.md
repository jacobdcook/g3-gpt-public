## How to run test suite `test_docs_page.py`

### Run the app

Make sure the frontend and backend are running

### Install Selenium

```
pip install selenium
```

### Run a fresh Chrome profile with remote debugging

Create an empty folder on your desktop (or anywhere outside the project) for the dummy profile

Mac/Linux:

```
chrome --remote-debugging-port=9222 --user-data-dir=/path/to/the/folder
```

Windows:

```
start chrome --remote-debugging-port=9222 --user-data-dir=/path/to/the/folder
```

### Before first run: Set up the Chrome instance

On the **Sign in to Chrome** screen click **Don't sign in**

In the Chrome window, go to the app `localhost:3000`, click the login button, and sign into the Azure account you're using for SSO

### Create a test file for upload

This test uses a file on your computer to test on. Create a .txt or .pdf outside of the project, and include the path to it in the command below

### Run script

Keep the Chrome window open, but close the `localhost:3000` tab

```
python3 test_docs_page.py
```
