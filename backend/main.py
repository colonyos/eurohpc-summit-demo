from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import shutil
from fastapi.staticfiles import StaticFiles
from PIL import Image
import matplotlib.pyplot as plt
import shutil
import io

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
    # Save the original image
    original_image_path = f"uploads/{file.filename}"
    with open(original_image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Open the saved image for processing
    original_image = Image.open(original_image_path)

    # Setting up matplotlib figure
    plt.figure(figsize=(8, 6))  # Adjust figure size as needed

    # Display the image with matplotlib
    plt.imshow(original_image)
    plt.axis('off')  # Hide the axis

    # Adjust layout to minimize white space
    plt.subplots_adjust(top=1, bottom=0, right=1, left=0, hspace=0, wspace=0)
    plt.margins(0, 0)
    plt.gca().xaxis.set_major_locator(plt.NullLocator())
    plt.gca().yaxis.set_major_locator(plt.NullLocator())

    # Save the processed image with minimal padding
    processed_image_path = f"uploads/processed_{file.filename}"
    plt.savefig(processed_image_path, bbox_inches='tight', pad_inches=0, dpi=300)
    plt.close()

    return {"filename": f"processed_{file.filename}"}
