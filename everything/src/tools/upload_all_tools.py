import os
import sys
import re
import argparse
import json
import importlib.util
import subprocess

def load_env_file(file_path):
    """Load environment variables from a .env file"""
    env_vars = {}
    
    if os.path.exists(file_path):
        print(f"Loading environment variables from {file_path}")
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    else:
        print(f"Warning: .env file not found at {file_path}")
    
    return env_vars

def import_module_from_file(file_path):
    """Import a module from a file path"""
    module_name = os.path.basename(file_path).replace('.py', '')
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def upload_tool(file_path, name, description, env_vars=None):
    """Upload a tool to Bookstack using the upload_tool_1A function"""
    # Import the upload_tool_1A function
    upload_script_path = os.path.join("..", "bookstack modification tools", "upload_tool_1A.py")
    
    # Check if the upload script exists
    if not os.path.exists(upload_script_path):
        print(f"Error: Upload script not found at {upload_script_path}")
        return False
    
    # Set environment variables
    if env_vars:
        for key, value in env_vars.items():
            os.environ[key] = value
        print(f"Using environment variables: {', '.join(env_vars.keys())}")
    
    # Try to import and use the upload_tool_1A function
    try:
        # Import the upload_tool_1A module
        upload_module = import_module_from_file(upload_script_path)
        upload_tool_1A = upload_module.upload_tool_1A
        
        # Read the tool code
        with open(file_path, 'r') as f:
            tool_code = f.read()
        
        # Ensure the tool name ends with _1A
        tool_name = name
        if not tool_name.endswith('_1A'):
            tool_name = f"{tool_name}_1A"
        
        # Create registration info
        registration_info = {
            "name": tool_name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": {
                    "params_json": {
                        "type": "string",
                        "description": "JSON string containing parameters for the tool"
                    }
                },
                "required": ["params_json"]
            },
            "category": "postiz"
        }
        
        # Upload the tool
        result = upload_tool_1A(
            tool_code=tool_code,
            tool_registration_info=json.dumps(registration_info),
            debug_level="INFO"
        )
        
        print(f"Uploaded {tool_name}: {json.dumps(result, indent=2)}")
        
        # Extract tool ID from result
        tool_id = None
        if result.get("success") == "true" and result.get("metadata"):
            try:
                metadata = json.loads(result["metadata"])
                tool_id = metadata.get("tool_id")
                if tool_id:
                    print(f"Extracted tool ID from metadata: {tool_id}")
            except json.JSONDecodeError:
                print("Failed to parse metadata as JSON")
        
        return tool_id
    except Exception as e:
        print(f"Error uploading {name}: {str(e)}")
        
        # Fall back to using subprocess if direct import fails
        print("Falling back to subprocess method...")
        cmd = [
            sys.executable,
            upload_script_path,
            "--file", file_path,
            "--name", name,
            "--description", description
        ]
        
        # Create environment with additional variables if provided
        env = os.environ.copy()
        if env_vars:
            env.update(env_vars)
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, env=env)
            print(f"Uploaded {name}: {result.stdout.strip()}")
            
            # Extract tool ID from output
            tool_id = None
            for line in result.stdout.split('\n'):
                if "Tool ID:" in line:
                    match = re.search(r"Tool ID:\s*(\S+)", line)
                    if match:
                        tool_id = match.group(1)
                        break
            
            return tool_id
        except subprocess.CalledProcessError as e:
            print(f"Error uploading {name}: {e.stderr}")
            return False

def attach_tool(agent_id, tool_id, env_vars=None):
    """Attach a tool to a Bookstack agent using the attach_tool_1A.py script"""
    attach_script = os.path.join("..", "bookstack modification tools", "attach_tool_1A.py")
    
    # Check if the attach script exists
    if not os.path.exists(attach_script):
        print(f"Error: Attach script not found at {attach_script}")
        return False
    
    # Run the attach script
    cmd = [
        sys.executable,
        attach_script,
        "--agent_id", agent_id,
        "--tool_id", tool_id
    ]
    
    # Create environment with additional variables if provided
    env = os.environ.copy()
    if env_vars:
        env.update(env_vars)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, env=env)
        print(f"Attached tool {tool_id} to agent {agent_id}: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error attaching tool {tool_id} to agent {agent_id}: {e.stderr}")
        return False

def main():
    # Define the tools to upload
    tools = [
        {
            "file": "create_post.py",
            "name": "create_post",
            "description": "Create a new post in Postiz"
        },
        {
            "file": "get_integrations.py",
            "name": "get_integrations",
            "description": "Get list of available integrations from Postiz"
        },
        {
            "file": "get_posts.py",
            "name": "get_posts",
            "description": "Get list of posts from Postiz"
        },
        {
            "file": "get_self.py",
            "name": "get_self",
            "description": "Get user information from Postiz"
        },
        {
            "file": "login.py",
            "name": "login",
            "description": "Login to Postiz API"
        }
    ]
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load environment variables from .env file in parent directory
    parent_dir = os.path.dirname(current_dir)
    env_file_path = os.path.join(parent_dir, '.env')
    env_vars = load_env_file(env_file_path)
    
    # Check for required environment variables
    required_vars = ['BOOKSTACK_BASE_URL', 'BOOKSTACK_PASSWORD', 'BOOKSTACK_AGENT_ID']
    missing_vars = [var for var in required_vars if var not in env_vars]
    
    if missing_vars:
        print(f"Warning: Missing environment variables: {', '.join(missing_vars)}")
        print("These variables are required for uploading tools to Bookstack.")
        print("Please make sure they are defined in the .env file or as environment variables.")
    else:
        print("All required environment variables found.")
    
    # Get agent ID from .env file or ask user
    default_agent_id = env_vars.get('BOOKSTACK_AGENT_ID', '')
    if default_agent_id:
        print(f"Found agent ID in environment: {default_agent_id}")
        use_default = input(f"Use this agent ID? (Y/n): ").strip().lower()
        if use_default != 'n':
            agent_id = default_agent_id
        else:
            agent_id = input("Enter the Bookstack agent ID to attach tools to (leave blank to skip attachment): ").strip()
    else:
        agent_id = input("Enter the Bookstack agent ID to attach tools to (leave blank to skip attachment): ").strip()
    
    # Upload and optionally attach each tool
    uploaded_tools = []
    
    for tool in tools:
        file_path = os.path.join(current_dir, tool["file"])
        
        # Check if the file exists
        if not os.path.exists(file_path):
            print(f"Error: Tool file not found at {file_path}")
            continue
        
        # Upload the tool
        print(f"\nUploading {tool['name']}...")
        tool_id = upload_tool(file_path, tool["name"], tool["description"], env_vars)
        
        if tool_id:
            uploaded_tools.append({
                "name": tool["name"],
                "id": tool_id
            })
            
            # Attach the tool if agent ID was provided
            if agent_id:
                print(f"Attaching {tool['name']} to agent {agent_id}...")
                attach_tool(agent_id, tool_id, env_vars)
    
    # Print summary
    print("\n=== Upload Summary ===")
    print(f"Total tools uploaded: {len(uploaded_tools)}")
    
    if uploaded_tools:
        print("\nUploaded tools:")
        for tool in uploaded_tools:
            print(f"- {tool['name']} (ID: {tool['id']})")
    
    if agent_id:
        print(f"\nAll tools have been attached to agent: {agent_id}")
    else:
        print("\nTo attach these tools to an agent, use the attach_tool_1A.py script:")
        for tool in uploaded_tools:
            print(f"python ../bookstack\ modification\ tools/attach_tool_1A.py --agent_id YOUR_AGENT_ID --tool_id {tool['id']}")

if __name__ == "__main__":
    main()