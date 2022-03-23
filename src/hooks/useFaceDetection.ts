import { useState, useEffect, useCallback, useRef } from 'react';
import { detectAllFaces, loadSsdMobilenetv1Model } from 'face-api.js';

export default function useFaceDetection() {
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const imageElement = useRef<HTMLImageElement>();

  const loadModels = useCallback(async () => {
    const MODEL_URL = '/models';

    try {
      await loadSsdMobilenetv1Model(MODEL_URL);

      return Promise.resolve();
    } catch(e) {
      return Promise.reject(e);
    }
  }, []);

  function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  async function getFaces(files: FileList) {
    const faces = [];

    if (!imageElement.current) {
      imageElement.current = document.createElement('img');
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const base64 = await toBase64(file);

      imageElement.current.src = base64;

      const detections = await detectAllFaces(imageElement.current);

      faces.push({
        fileName: file.name,
        faces: detections,
        image: base64,
      });
    };

    return Promise.all(faces);
  }

  useEffect(() => {
    if (!modelsLoaded) {
      loadModels()
        .then(() => setModelsLoaded(true))
        .catch((e) => console.error(e));
    }
  }, [loadModels, modelsLoaded]);

  return {
    modelsLoaded,
    getFaces,
  };
}
