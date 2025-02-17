from fastapi import APIRouter, File, UploadFile, HTTPException, Form
import pandas as pd
from io import BytesIO
from supabase_client import supabase
import os
from dotenv import load_dotenv
import uuid
import time

# Load environment variables from .env file
load_dotenv()

SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")

router = APIRouter()

# File Validation Endpoint
@router.post("/validate-file")
async def validate_file(file: UploadFile = File(...)):
    # Check file extension
    if not file.filename.endswith((".csv", ".xls", ".xlsx")):
        raise HTTPException(status_code=400, detail="Invalid file type")
    # Read File
    contents = await file.read()
    df = None

    if file.filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(contents))
    else:
        df = pd.read_excel(BytesIO(contents))

    # Validate structure (Check if expected columns exist)
    required_columns = ["cid", "name", "url"]
    if not all(col in df.columns for col in required_columns):
        raise HTTPException(status_code=400, detail="Missing required columns - please have columns cid, name and url")

    # Send Preview (Top 10 Rows)
    preview = {
        "headers": df.columns.tolist(),
        "rows": df.head(10).fillna("").values.tolist(),
        "len" : len(df)
    }
    return {"preview": preview}

# Upload File to Supabase Storage
@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...), user_email: str = Form(...)):
    try:
        # Generate a UUID filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/{unique_filename}"

        # Read file content to count rows
        contents = await file.read()
        df = None

        if file.filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))

        num_rows = len(df) if df is not None else 0

        # Upload file to Supabase Storage
        res = supabase.storage.from_("ascend-tagging-input-excels").upload(file_path, contents)

        # Check if upload was successful
        # if res.error:
        #     raise HTTPException(status_code=400, detail=res.error.message)

        # Insert metadata into Supabase database
        db_res = supabase.table("ascend-tagging-input-excels-records").insert({
            "user_email": user_email,
            "original_file_name": file.filename,
            "unique_file_name": unique_filename,
            "upload_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),  # Date & time
            "num_rows": num_rows
        }).execute()

        # if db_res.error:
        #     raise HTTPException(status_code=400, detail=db_res.error.message)

        return {
            "message": "File uploaded successfully",
            "file_path": file_path,
            "num_rows": num_rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
