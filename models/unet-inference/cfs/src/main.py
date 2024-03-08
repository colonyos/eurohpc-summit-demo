import os
import numpy as np
from tqdm import tqdm
import cv2 as cv
from PIL import Image
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
import sys

from keras import Model
from keras.callbacks import Callback
from keras.optimizers import Adam
from keras.layers import Input, Conv2D, Conv2DTranspose, MaxPooling2D, concatenate, Dropout
import logging

handler = logging.StreamHandler(sys.stdout)
handler.flush = sys.stdout.flush  # Ensure flush method is called on each log entry

# Configure the root logger
logging.basicConfig(level=logging.INFO, handlers=[handler])

logger = logging.getLogger(__name__)

# The projdir is the location on the executor where project dirs have been synced
projdir = str(os.environ.get("PROJECT_DIR"))

# The processid is the unique id of the process where this code will execute at a remove executor
processid = os.environ.get("COLONIES_PROCESS_ID")

print("projdir:", projdir)
print("processid:", processid)

sys.stdout.flush()

####################################################
# Define U-net architecture
####################################################

SIZE = 128

def unet_model(input_layer, start_neurons):
    # Contraction path
    conv1 = Conv2D(start_neurons, kernel_size=(3, 3), activation="relu", padding="same")(input_layer)
    conv1 = Conv2D(start_neurons, kernel_size=(3, 3), activation="relu", padding="same")(conv1)
    pool1 = MaxPooling2D((2, 2))(conv1)
    pool1 = Dropout(0.25)(pool1)

    conv2 = Conv2D(start_neurons*2, kernel_size=(3, 3), activation="relu", padding="same")(pool1)
    conv2 = Conv2D(start_neurons*2, kernel_size=(3, 3), activation="relu", padding="same")(conv2)
    pool2 = MaxPooling2D((2, 2))(conv2)
    pool2 = Dropout(0.5)(pool2)

    conv3 = Conv2D(start_neurons*4, kernel_size=(3, 3), activation="relu", padding="same")(pool2)
    conv3 = Conv2D(start_neurons*4, kernel_size=(3, 3), activation="relu", padding="same")(conv3)
    pool3 = MaxPooling2D((2, 2))(conv3)
    pool3 = Dropout(0.5)(pool3)

    conv4 = Conv2D(start_neurons*8, kernel_size=(3, 3), activation="relu", padding="same")(pool3)
    conv4 = Conv2D(start_neurons*8, kernel_size=(3, 3), activation="relu", padding="same")(conv4)
    pool4 = MaxPooling2D((2, 2))(conv4)
    pool4 = Dropout(0.5)(pool4)

    # Middle
    convm = Conv2D(start_neurons*16, kernel_size=(3, 3), activation="relu", padding="same")(pool4)
    convm = Conv2D(start_neurons*16, kernel_size=(3, 3), activation="relu", padding="same")(convm)
    
    # Expansive path
    deconv4 = Conv2DTranspose(start_neurons*8, kernel_size=(3, 3), strides=(2, 2), padding="same")(convm)
    uconv4 = concatenate([deconv4, conv4])
    uconv4 = Dropout(0.5)(uconv4)
    uconv4 = Conv2D(start_neurons*8, kernel_size=(3, 3), activation="relu", padding="same")(uconv4)
    uconv4 = Conv2D(start_neurons*8, kernel_size=(3, 3), activation="relu", padding="same")(uconv4)

    deconv3 = Conv2DTranspose(start_neurons*4, kernel_size=(3, 3), strides=(2, 2), padding="same")(uconv4)
    uconv3 = concatenate([deconv3, conv3])
    uconv3 = Dropout(0.5)(uconv3)
    uconv3 = Conv2D(start_neurons*4, kernel_size=(3, 3), activation="relu", padding="same")(uconv3)
    uconv3 = Conv2D(start_neurons*4, kernel_size=(3, 3), activation="relu", padding="same")(uconv3)

    deconv2 = Conv2DTranspose(start_neurons*2, kernel_size=(3, 3), strides=(2, 2), padding="same")(uconv3)
    uconv2 = concatenate([deconv2, conv2])
    uconv2 = Dropout(0.5)(uconv2)
    uconv2 = Conv2D(start_neurons*2, kernel_size=(3, 3), activation="relu", padding="same")(uconv2)
    uconv2 = Conv2D(start_neurons*2, kernel_size=(3, 3), activation="relu", padding="same")(uconv2)

    deconv1 = Conv2DTranspose(start_neurons*1, kernel_size=(3, 3), strides=(2, 2), padding="same")(uconv2)
    uconv1 = concatenate([deconv1, conv1])
    uconv1 = Dropout(0.5)(uconv1)
    uconv1 = Conv2D(start_neurons, kernel_size=(3, 3), activation="relu", padding="same")(uconv1)
    uconv1 = Conv2D(start_neurons, kernel_size=(3, 3), activation="relu", padding="same")(uconv1)
    
    # Last conv and output
    output_layer = Conv2D(1, (1,1), padding="same", activation="sigmoid")(uconv1)
    
    return output_layer

# Compile unet model
input_layer = Input((SIZE, SIZE, 3))
output_layer = unet_model(input_layer = input_layer, start_neurons = 16)

model = Model(input_layer, output_layer)
model.compile(loss="binary_crossentropy", optimizer="adam", metrics=["accuracy"])
model.summary()

weights_path = projdir + '/data/weights_60epoch.h5'
model.load_weights(weights_path)

# Load the image
image_path = projdir + '/data/water_body_17.jpg'
image = Image.open(image_path)

# Preprocess the image
image = image.resize((SIZE, SIZE))
image_array = np.asarray(image).astype('float32') / 255.0  # Normalize pixel values if your model expects this
image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension

# Perform inference
prediction = model.predict(image_array)

# Process the output (for example, in case of segmentation, you might want to apply a threshold)
# This step depends on your specific use case and model output

# If the output is a segmentation mask, you might want to visualize it
if prediction.shape[-1] == 1:  # Assuming the model outputs a single-channel segmentation mask
    predicted_mask = prediction[0, :, :, 0]  # Remove batch dimension and get the mask
    thresholded_mask = (predicted_mask > 0.5).astype(np.uint8)  # Apply a threshold to get a binary mask

# Load the original image
original_image = Image.open(image_path)
original_image = original_image.resize((SIZE, SIZE))
original_image_array = np.asarray(original_image).astype('float32') / 255.0

# Preprocess the image for the model
image_for_model = np.expand_dims(original_image_array, axis=0)  # Add batch dimension

# Perform inference to get the mask
predicted_mask = model.predict(image_for_model)[0, :, :, 0]  # Assuming the model outputs a single-channel mask

# Apply a threshold to create a binary mask
thresholded_mask = (predicted_mask > 0.5).astype(np.uint8)

# Create a red mask where the water regions will be colored in red
# The red mask has the same height and width as the original image, but with 3 channels for RGB
red_mask = np.zeros_like(original_image_array)
red_mask[:, :, 0] = 1  # Set the red channel to maximum

# Apply the red mask on the original image
colored_image = np.where(thresholded_mask[:, :, np.newaxis] == 1, red_mask, original_image_array)

plt.figure(figsize=(8, 6))  # Adjust figure size as needed
plt.axis('off')  # Hide the axis
plt.subplots_adjust(top=1, bottom=0, right=1, left=0, hspace=0, wspace=0)
plt.margins(0, 0)
plt.gca().xaxis.set_major_locator(plt.NullLocator())
plt.gca().yaxis.set_major_locator(plt.NullLocator())

plt.imshow(colored_image)

plt.tight_layout()
plt.savefig(projdir + '/result/inference.png')
