"""
Tool to create a new post using Postizz API
"""
import requests
import json
from typing import Dict, Any, Optional, List

def create_post(
    content: str,
    integration_id: str,
    post_type: str = "now",
    publish_date: Optional[str] = None,
    media_urls: Optional[List[str]] = None,
    short_link: bool = False
) -> Dict[str, Any]:
    """
    Create a new post via Postizz API
    
    Args:
        content: Text content of the post (minimum 6 characters)
        integration_id: Integration ID to post to
        post_type: Type of post ("draft", "schedule", or "now")
        publish_date: Optional ISO format date (e.g. "2025-01-04T19:46:00.000Z")
        media_urls: Optional list of media URLs to attach
        short_link: Whether to create a short link
        
    Returns:
        Dict containing created post data
    """
    if len(content) < 6:
        raise ValueError("Content must be at least 6 characters long")
    
    if post_type not in ["draft", "schedule", "now"]:
        raise ValueError('post_type must be one of: "draft", "schedule", "now"')
    
    API_URL = "https://postiz.oculair.ca/api/public/v1/posts"
    headers = {
        "Authorization": "255364482e25a51ff9a6660135b8c88995e7ae68615fb9a67ad14d601f8fe0ff",
        "Content-Type": "application/json"
    }
    
    # Build post value array
    value = [{"content": content}]  # Using "content" field
    if media_urls:
        for url in media_urls:
            value.append({"media": url})
    
    post = {
        "integration": {  # Single object with id field
            "id": integration_id
        },
        "value": value
    }
    
    post_data = {
        "type": post_type,
        "shortLink": short_link,
        "date": publish_date or "2025-02-27T19:30:00.000Z",
        "posts": [post]
    }
    
    print(f"Making request to {API_URL}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Post data: {json.dumps(post_data, indent=2)}")
    
    try:
        response = requests.post(API_URL, headers=headers, json=post_data)
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        response.raise_for_status()
        data = response.json()
        print(f"\nResponse Data: {json.dumps(data, indent=2)}")
        return data
        
    except requests.exceptions.RequestException as e:
        error_message = f"Failed to create post: {str(e)}"
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
        # Example usage
        post = create_post(
            content="Testing the Postizz API integration",
            integration_id="cm5hudkk000017412anjxa09j",
            post_type="now",
            publish_date="2025-02-27T19:30:00.000Z",
            short_link=False
        )
    except Exception as e:
        print(f"\nScript failed: {str(e)}")