# Pinecone Sample API

This is a sample API for testing Pinecone.

## Getting Started

-   We need pip, which is likely installed as part of Python, but installation can be verified if the following command returns a version:

```bash
pip --version
# e.g. pip 23.2 from ... (python 3.11)
```

-   If not, use [curl](https://stackoverflow.com/a/16216825) to run the install script:

```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```

## Dependencies

-   The current dependencies for this demo are: pinecone-client, python-dotenv.
-   They can be installed with:

```bash
pip install -r requirements.txt
```

-   The application will still fail to run, because we need an API key.

## Securely accessing the API

### Create a .env file

-   Go to our project's console [here](https://app.pinecone.io/organizations/-NuhN253phW1uVEZJl-X/projects/9eed22b0-41bb-4742-86f9-f975d9702bc1/keys)
-   Copy the 'default' API key
-   In the 'sample-pinecone' directory, create a new file called `.env`
    -   This file is ignored in the `.gitignore` -- it won't be pushed to the GitHub repo, and this step will need to be repeated on any new machine that wishes to run the application
    -   This keeps private information like the API key out of the GitHub repo
-   Edit the `.env` file and add the following lines, subsituting your API key:

```
PINECONE_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
```

### Using the API key in a python program

Now, the application imports the API key from the `.env` file:

```python
import os
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
```

and the API can be used with:

```python
key = os.environ.get('PINECONE_API_KEY') # key = this-is-an-api-key
```

## Pinecone

Visit the Pinecone [Quickstart](https://docs.pinecone.io/guides/getting-started/quickstart) for information on how to get started
