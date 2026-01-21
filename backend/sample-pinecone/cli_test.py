# https://fastapi.tiangolo.com/tutorial/testing/#extended-fastapi-app-file

# TO RUN TESTS:
# - pip install pytest
# - run `pytest` in sample-pinecone

from fastapi.testclient import TestClient
import cli
import cli_test_utils as utils

test_client = TestClient(cli.app)

# You can access any var or fn you need from cli.py with cli.<name>

# We also keep values (cli_test_utils.py) for test values like Pinecone responses. These can be accessed with utils.<name>, or defined in that file


# Define your test function here
# - FOR PYTEST: the function must start with test_ or end with _test


def test_role_filter():
    """
    Tests ability to filter vectors by role. Uses a predefined set of vectors
    """

    # Contains all vectors with role "Admin"
    fake_pinecone_res = utils.PINECONE_RESPONSE["dynamic_lighting_system"]

    context = cli.get_context(
        "What can you tell me about the Dynamic Lighting System?",
        "HR",
        fake_pinecone_res,
    )

    assert context == ("@NO KNOWLEDGE@", False)

    context = cli.get_context(
        "What can you tell me about the Dynamic Lighting System?",
        "Admin",
        fake_pinecone_res,
    )

    assert context[1] == True and context[0] != "@NO KNOWLEDGE@"
