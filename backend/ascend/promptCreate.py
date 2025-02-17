from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from dotenv import load_dotenv
from .dataModels import TagData, TagDataFinal
from .ai_handling.promptCreation import create_prompt

load_dotenv()

router = APIRouter()

@router.post('/generate-prompt')
async def generate_prompt(tagData : TagData):
    if not tagData.tag_type or not tagData.tag_name or not tagData.description:
        raise HTTPException(status_code=400, detail="Required fields missing")
    
    prompt = create_prompt(
        tagType=tagData.tag_type,
        tagName=tagData.tag_name,
        tagDesc= tagData.description
    )

    return {
        'desc' : prompt.desc,
        'changes' : prompt.suggested_changes
        }

@router.post('/upload-prompt')
async def upload_prompt(tagData : TagDataFinal):
    if not tagData.tag_type or not tagData.tag_name or not tagData.description or not tagData.tag_identifier:
        raise HTTPException(status_code=400, detail="Required fields missing")
    
    try:
        db_res = supabase.table("ascend-tagging-input-prompts").insert({
            "user_email": tagData.user_email,
            "tag_type": tagData.tag_type,
            "tag_name": tagData.tag_name,
            "tag_desc": tagData.description,
            "lang_inst":tagData.langInstructions,
            "tag_identifier":tagData.tag_identifier
        }).execute()

            # if db_res.error:
            #     raise HTTPException(status_code=400, detail=db_res.error.message)

        return {
            "message": "Prompt uploaded successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))