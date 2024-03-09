from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import shutil
from fastapi.staticfiles import StaticFiles
from PIL import Image
import matplotlib.pyplot as plt
import shutil
from pycolonies import colonies_client 
import os
import threading
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
import asyncio

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

app.mount("/images", StaticFiles(directory="images"), name="images")
app.mount("/generated-images", StaticFiles(directory="generated-images"), name="generated-images")

def generate_funcspec(image_name):
    return {
        "nodename": "",
        "funcname": "execute",
        "args": [],
        "kwargs": {
            "args": [
                "/cfs/eurohpc-summit-demo/models/serving/main.py"
            ],
            "cmd": "python3",
            "docker-image": "johan/hackaton",
            "init-cmd": "",
            "rebuild-image": False
        },
        "priority": 5,
        "maxwaittime": -1,
        "maxexectime": 599,
        "maxretries": 3,
        "conditions": {
            "colonyname": "hpc",
            "executornames": [
                "rocinante"
            ],
            "executortype": "container-executor",
            "dependencies": [],
            "nodes": 1,
            "cpu": "10000m",
            "processes": 0,
            "processes-per-node": 1,
            "mem": "15000Mi",
            "storage": "",
            "gpu": {
                "name": "",
                "mem": "",
                "count": 1,
                "nodecount": 0
            },
            "walltime": 600
        },
        "fs": {
            "mount": "/cfs",
            "dirs": [
                {
                    "label": "/eurohpc-summit-demo/models/serving",
                    "dir": "/eurohpc-summit-demo/models/serving",
                    "keepfiles": True,
                    "onconflicts": {
                        "onstart": {
                            "keeplocal": False
                        },
                        "onclose": {
                            "keeplocal": False
                        }
                    }
                },
                {
                    "label": "/eurohpc-summit-demo/pretrained-models",
                    "dir": "/eurohpc-summit-demo/pretrained-models",
                    "keepfiles": True,
                    "onconflicts": {
                        "onstart": {
                            "keeplocal": False
                        },
                        "onclose": {
                            "keeplocal": True
                        }
                    }
                },
                {
                    "label": "/eurohpc-summit-demo/images",
                    "dir": "/eurohpc-summit-demo/images",
                    "keepfiles": True,
                    "onconflicts": {
                        "onstart": {
                            "keeplocal": False
                        },
                        "onclose": {
                            "keeplocal": False
                        }
                    }
                },
                {
                    "label": "/eurohpc-summit-demo/generated-images",
                    "dir": "/eurohpc-summit-demo/generated-images",
                    "keepfiles": True,
                    "onconflicts": {
                        "onstart": {
                            "keeplocal": False
                        },
                        "onclose": {
                            "keeplocal": True
                        }
                    }
                }
            ]
        },
        "env": {
            "IMAGE": image_name,
        }
}

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    original_image_path = f"images/{file.filename}"
    with open(original_image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    original_image = Image.open(original_image_path)

    plt.figure(figsize=(8, 6))  # Adjust figure size as needed
    plt.imshow(original_image)
    plt.axis('off')  # Hide the axis
    plt.subplots_adjust(top=1, bottom=0, right=1, left=0, hspace=0, wspace=0)
    plt.margins(0, 0)
    plt.gca().xaxis.set_major_locator(plt.NullLocator())
    plt.gca().yaxis.set_major_locator(plt.NullLocator())

    processed_image_path = f"images/{file.filename}"
    plt.savefig(processed_image_path, bbox_inches='tight', pad_inches=0, dpi=300)
    plt.close()
        
    colonies, colonyname, _, _, prvkey = colonies_client()
    colonies.sync(f"images", "/eurohpc-summit-demo/images", False, colonyname, prvkey)

    print(f"Image uploaded: {file.filename}")
    return {"filename": f"{file.filename}"}

class AnalyzeRequest(BaseModel):
    filename: str

def submit(filename):
    colonies, colonyname, _, _, prvkey = colonies_client()
    funcspec = generate_funcspec(filename)
    process = colonies.submit(funcspec, prvkey)
    colonies.wait(process, 100, prvkey)
    colonies.sync(f"generated-images", "/eurohpc-summit-demo/generated-images", False, colonyname, prvkey)
    return filename 

async def async_submit(filename):
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, submit , filename)
    return result

@app.post("/analyze/")
async def analyze_image(request: AnalyzeRequest):
   filename = request.filename
   generated_filename = await async_submit(filename)
   
   print(f"Image analyzed: {filename}")
   return {"generated_filename": f"{generated_filename}"}
