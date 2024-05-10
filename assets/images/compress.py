import os
from PIL import Image

def resize_images(directory, target_size=(150, 150)):
    # Define allowed extensions
    extensions = ('.jpg', '.jpeg', '.png')

    # Check each file in the directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            # Check if the file has the correct extension and does not end with '-150'
            if file.lower().endswith(extensions) and not file.lower().endswith('-150.jpg') and not file.lower().endswith('-150.jpeg') and not file.lower().endswith('-150.png'):
                file_path = os.path.join(root, file)
                try:
                    # Open the image
                    with Image.open(file_path) as img:
                        # Resize the image
                        img = img.resize(target_size, Image.LANCZOS)
                        
                        # Prepare the new filename
                        base, extension = os.path.splitext(file)
                        new_filename = f"{base}-150{extension}"
                        new_file_path = os.path.join(root, new_filename)
                        
                        # Save the image with a new filename
                        img.save(new_file_path)
                        print(f"Resized and saved as {new_file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

# Specify the directory you want to process
directory_to_process = '.'
resize_images(directory_to_process)