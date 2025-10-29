import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} scale={1.5} />
    </Center>
  );
}

export default function ModelViewerContent({ modelUrl }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        height: '450px',
        background: 'linear-gradient(135deg, #f0f2f5, #ffffff)',
        borderRadius: '20px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto', // Căn giữa component trên trang
      }}
    >
      <Canvas
        camera={{ position: [2, 2, 4], fov: 45 }}
        shadows
        style={{ borderRadius: '20px' }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 3, 3]} intensity={2} castShadow />

        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <Model url={modelUrl} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
