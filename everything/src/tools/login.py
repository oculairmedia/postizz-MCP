"""
Tool to login to Postizz API and get auth token
"""
import requests
import json

def login(email: str, password: str) -> dict:
    """
    Login to Postizz API
    
    Args:
        email: User email
        password: User password
        
    Returns:
        Dict containing auth token and user info
    """
    API_URL = "https://postiz.oculair.ca/api/auth/login"
    headers = {
        "Content-Type": "application/json"
    }
    
    login_data = {
        "email": email,
        "password": password
    }
    
    print(f"Making login request to {API_URL}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Login data: {json.dumps({**login_data, 'password': '*****'}, indent=2)}")
    
    try:
        response = requests.post(API_URL, headers=headers, json=login_data)
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        response.raise_for_status()
        data = response.json()
        print(f"\nLogin successful!")
        return data
        
    except requests.exceptions.RequestException as e:
        error_message = f"Login failed: {str(e)}"
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_message += f"\nResponse Status: {e.response.status_code}"
                error_message += f"\nResponse Body: {e.response.text}"
            except:
                pass
        print(f"\nError: {error_message}")
        raise Exception(error_message)

if __name__ == "__main__":
    try:
        # Replace with actual credentials
        result = login("test@example.com", "password123")
        print("\nAuth token received. You can use this token in other API calls.")
    except Exception as e:
        print(f"\nScript failed: {str(e)}")