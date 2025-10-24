import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function ModelViewer({ meshUrl }) {
  const mountRef = useRef();
  const [isRotating, setIsRotating] = useState(true);
  const [bgColor, setBgColor] = useState("#f0f0f0");
  const [lightIntensity, setLightIntensity] = useState(1);

  useEffect(() => {
    if (!meshUrl) return;
    const fileUrl = `/meshy/${meshUrl.replace("https://assets.meshy.ai/", "")}`;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loader = new GLTFLoader();
    let model = null;

    loader.load(
      fileUrl,
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1, 1, 1);
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);
        scene.add(model);
      },
      undefined,
      (err) => console.error("GLTF Load Error:", err)
    );

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      if (model && isRotating) model.rotation.y += 0.005;
      directionalLight.intensity = lightIntensity;
      scene.background = new THREE.Color(bgColor);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [meshUrl, isRotating, bgColor, lightIntensity]);

  return (
    <div className="relative w-full h-[500px]" ref={mountRef}>
      {/* Thanh setting nổi góc phải */}
      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-md flex flex-col gap-2">
        <button
          className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
          onClick={() => setIsRotating((prev) => !prev)}
        >
          {isRotating ? "⏸ Dừng xoay" : "🔁 Xoay"}
        </button>

        <label className="text-xs font-medium">🎨 Nền:</label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-full h-6 p-0 border-none"
        />

        <label className="text-xs font-medium">💡 Ánh sáng:</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={lightIntensity}
          onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
