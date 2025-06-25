"""
Tool to get posts from Postizz API
"""
import requests
import json
from typing import Dict, Any, Optional

def get_posts(
    display: str = "month",
    year: int = 2025,
    month: int = 1,
    week: int = 1,
    day: int = 1,
    newest_first: bool = True
) -> Dict[str, Any]:
    """
    Get list of posts from Postizz API with date filtering
    
    Args:
        display: Display mode ("month", "week", "day")
        year: Filter by year
        month: Filter by month (1-12)
        week: Filter by week (1-52)
        day: Filter by day (1-31)
        newest_first: Sort posts by date (True=newest first, False=oldest first)
        
    Returns:
        Dict containing posts data
    """
    API_URL = "https://postiz.oculair.ca/api/public/v1/posts"
    headers = {
        "Authorization": "255364482e25a51ff9a6660135b8c88995e7ae68615fb9a67ad14d601f8fe0ff",
        "Content-Type": "application/json"
    }
    
    params = {
        "display": display,
        "year": year,
        "month": month,
        "week": week,
        "day": day,
        "sort": "desc" if newest_first else "asc"
    }
    
    print(f"Making request to {API_URL}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Params: {json.dumps(params, indent=2)}")
    
    try:
        response = requests.get(API_URL, headers=headers, params=params)
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        response.raise_for_status()
        data = response.json()
        print(f"\nResponse Data: {json.dumps(data, indent=2)}")
        return data
        
    except requests.exceptions.RequestException as e:
        error_message = f"Failed to get posts: {str(e)}"
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
        # Test with a wider date range
        test_months = [1, 2]  # Testing January and February
        for month in test_months:
            print(f"\nTesting month {month} with newest_first=True")
            posts = get_posts(
                display="month",
                year=2025,
                month=month,
                week=1,
                day=1,
                newest_first=True
            )
            print("\n" + "="*80)
            
            print(f"\nTesting month {month} with newest_first=False")
            posts = get_posts(
                display="month",
                year=2025,
                month=month,
                week=1,
                day=1,
                newest_first=False
            )
            print("\n" + "="*80)
    except Exception as e:
        print(f"\nScript failed: {str(e)}")