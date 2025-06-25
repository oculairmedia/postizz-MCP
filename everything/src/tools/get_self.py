"""
Tool to get current user info from Postizz API
"""
import requests
import json

def get_self() -> dict:
    """
    Get current user information
    
    Returns:
        Dict containing user info
    """
    API_URL = "https://postiz.oculair.ca/api/user/self"
    headers = {
        "Authorization": "255364482e25a51ff9a6660135b8c88995e7ae68615fb9a67ad14d601f8fe0ff",
        "Content-Type": "application/json"
    }
    
    print(f"Making request to {API_URL}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    
    try:
        response = requests.get(API_URL, headers=headers)
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        response.raise_for_status()
        data = response.json()
        print(f"\nResponse Data: {json.dumps(data, indent=2)}")
        return data
        
    except requests.exceptions.RequestException as e:
        error_message = f"Failed to get user info: {str(e)}"
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
        user_info = get_self()
    except Exception as e:
        print(f"\nScript failed: {str(e)}")