import sys
import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import cv2
    import numpy as np
    import pytesseract
    from PIL import Image
except ImportError as e:
    logger.error(f"Missing dependencies: {e}")
    # Mocking for environments where dependencies fail to install
    cv2 = None
    np = None
    pytesseract = None
    Image = None

class OCRService:
    def __init__(self):
        self.config = r'--oem 3 --psm 6'
        logger.info("OCR Service Initialized")

    def preprocess_image(self, image_path):
        if cv2 is None:
            return None
        
        # Read image
        img = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding to preprocess the image
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
        
        # Denoise
        gray = cv2.medianBlur(gray, 3)
        
        return gray

    def extract_text(self, image_path):
        if pytesseract is None:
            return "OCR Engine not available (Missing dependencies)"
            
        try:
            # Preprocess
            processed_img = self.preprocess_image(image_path)
            
            if processed_img is not None:
                # Use preprocessed image
                text = pytesseract.image_to_string(processed_img, config=self.config)
            else:
                # Fallback to PIL if CV2 fails or for simple cases
                text = pytesseract.image_to_string(Image.open(image_path), config=self.config)
                
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            return f"Error analyzing image: {str(e)}"

    def analyze_image(self, image_path):
        """
        Comprehensive analysis including OCR and object detection (mocked for now)
        """
        text_result = self.extract_text(image_path)
        
        return {
            "text_detected": text_result,
            "objects": ["Detected Object 1", "Detected Object 2"], # Placeholder for YOLO/MobileNet integration
            "sentiment": "Neutral", # Placeholder for sentiment analysis
            "confidence": 0.95
        }

if __name__ == "__main__":
    # Simple CLI for testing
    if len(sys.argv) > 1:
        service = OCRService()
        result = service.analyze_image(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python ocr_service.py <image_path>")
