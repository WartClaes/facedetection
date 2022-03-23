import { useState, useEffect, useMemo, useRef } from 'react';

import useFaceDetection from '../src/hooks/useFaceDetection';

import styles from './Home.module.css';

export default function Home() {
  const [timing, setTiming] = useState<number>();
  const [faces, setFaces] = useState<any[]>();
  const [disabled, setDisabled] = useState<boolean>(true);

  const filesRef = useRef<HTMLInputElement>(null);

  const { modelsLoaded, getFaces } = useFaceDetection();

  const numberOfFaces = useMemo((): number => {
    return faces?.map((f) => f.faces.length).reduce((a, b) => a + b, 0) || 0;
  }, [faces]);

  async function get() {
    if (!filesRef.current?.files) return;

    setTiming(undefined);
    setDisabled(true);
    setFaces(undefined);

    const t0 = performance.now();

    const res = await getFaces(filesRef.current.files);

    const t1 = performance.now();

    setTiming(t1 - t0);

    setFaces(res);
    setDisabled(false);
  }

  useEffect(() => {
    if (!modelsLoaded) return;

    setDisabled(false);
  }, [modelsLoaded]);

  return (
    <div className={styles.wrapper}>
      <h1>Faces</h1>

      <input multiple type="file" ref={filesRef} />

      <button disabled={disabled} onClick={get}>get faces</button>

      { timing && (
        <div className={styles.timing}>
          {faces?.length || 0} photos ({numberOfFaces} faces) in {timing / 1000}s
        </div>
      )}

      <div className={styles.images}>
        { faces && (
          faces.map((face) => (
            <div key={face.fileName} className={styles.imageWrapper}>
              <img className={styles.image} src={face.image} />
              <span className={styles.amount}>{face.faces.length}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
