from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ascend.checkFile import router as check_file_router
from ascend.promptCreate import router as prompt_router
from ascend.startProject import router as start_project_router


app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include the router
app.include_router(check_file_router)
app.include_router(prompt_router)
app.include_router(start_project_router)