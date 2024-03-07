from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import shutil
from fastapi.staticfiles import StaticFiles

app = FastAPI()

origins = [
        "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve files from the "uploads" directory under the "/uploads" route
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    with open(f"uploads/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": file.filename}
