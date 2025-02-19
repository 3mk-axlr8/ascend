from fastapi import APIRouter, Query, HTTPException, Form
import pandas as pd
from io import BytesIO
from supabase_client import supabase
import os
from dotenv import load_dotenv
from typing import List

# Load environment variables from .env file
load_dotenv()

SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")

router = APIRouter()

@router.get("/get_files")
async def get_files(email: str = Query(..., title="User Email")):
    """Fetches the list of files uploaded by a specific user."""
    
    if not email:
        return {"error": "User email is required"}
    
    try:
        # Query Supabase for files belonging to the user
        response = (
            supabase.table("ascend-tagging-input-excels-records")
            .select("id, upload_timestamp, user_email, original_file_name, num_rows")
            .eq("user_email", email).execute()
        )
        files = response.data
        return {"files": files}
    
    except Exception as e:
        return {"error": str(e)}
    

@router.get("/get_preview")
async def get_preview(file_id: str = Query(..., title="File ID")):
    if not file_id:
        return {"error" : "File ID not provided"}
    
    try:
        response = supabase.table("ascend-tagging-input-excels-records").select("unique_file_name").eq("id", file_id).execute()
        files = response.data

        if not files:
            raise HTTPException(status_code=404, detail="File not found")

        file_name = files[0]['unique_file_name']
        file_path = f"uploads/{file_name}"

        final_file = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).download(file_path)

        if final_file:
            # Convert response (bytes) to DataFrame
            df = pd.read_excel(BytesIO(final_file), engine="openpyxl")

            preview = {
                "headers": df.columns.tolist(),
                "rows": df.head(10).fillna("").values.tolist(),
                "len" : len(df)
            }
            return {"preview": preview}
        else:
            return {"error" : "Failed to fetch file"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get_prompts")
async def get_files(email: str = Query(..., title="User Email")):
    """Fetches the list of files uploaded by a specific user."""
    
    if not email:
        return {"error": "User email is required"}
    
    try:
        # Query Supabase for files belonging to the user
        response = (
            supabase.table("ascend-tagging-input-prompts")
            .select("id, created_at, user_email, tag_type, tag_name, tag_identifier, tag_desc")
            .eq("user_email", email).execute()
        )
        prompts = response.data
        return {"prompts": prompts}
    
    except Exception as e:
        return {"error": str(e)}
    

@router.post("/submit_tag_request")
async def tag_request(user_email: str = Form(...),file: str = Form(...),prompts: List[str] = Form(...), ):
    print(user_email)
    print(file)
    print(prompts)

    data = {
        "task_id" : "1",
        "email" : user_email,
        "file" : file,
        "prompts" : prompts
    }


    return "abc"

# @router.get("/status/")
# def check_status(task_id: str):
