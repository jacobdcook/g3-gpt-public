import os
import requests
from azure.identity import ClientSecretCredential

# NOTE: These values should be stored in environment variables, not hardcoded
# For production, use: os.getenv('AZURE_TENANT_ID'), etc.
TENANT_ID = os.getenv('AZURE_TENANT_ID', 'your-tenant-id-here')  # Tenant ID found in MS Entra Page
CLIENT_ID = os.getenv('AZURE_CLIENT_ID', 'your-client-id-here')  # Application Client_ID
CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET', 'your-client-secret-here')  # Application Client Value
USER_ID = os.getenv('AZURE_USER_ID', 'your-user-id-here')  # User Object ID

# Authenticate using ClientSecretCredential
credentials = ClientSecretCredential(
    tenant_id=TENANT_ID,
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET
)

#Access token for Microsoft Graph API
token = credentials.get_token("https://graph.microsoft.com/.default")
#MS Graph API - get the user info
url = f"https://graph.microsoft.com/v1.0/users/{USER_ID}/memberOf"
# Set up the headers with the Bearer token
headers = {
    'Authorization': f'Bearer {token.token}',
    'Content-Type': 'application/json'
}

#This is the GET user request
response = requests.get(url, headers=headers)

#Checks to see if the request was successful
if response.status_code == 200:
    memberships = response.json()
    for role in memberships['value']:
        print(f"Role/Group: {role['displayName']}")
else:
    print(f"Error: {response.status_code} - {response.text}")
