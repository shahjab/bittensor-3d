import { useEffect } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader, Vector3 } from 'three';

import SunSurface from "./surfaces/sun.jpg"
import { sizeSun } from "../values/measurements";

export default function Sun({sunRef, radius=sizeSun, position=[0,0,0], onClick}) {
    const texture = useLoader(TextureLoader, SunSurface);

    useFrame(()=>{
        sunRef.current.rotation.y = sunRef.current.rotation.y+0.002
    })
    const handleClick = () => {
        onClick(position);
    }
    
    return (
        <mesh ref={sunRef} position={position}  onClick={handleClick}>
            <sphereBufferGeometry args={[radius]} />
            <meshBasicMaterial attach="material" map={texture} />
        </mesh>
    )
}