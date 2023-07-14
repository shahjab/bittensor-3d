import { sizeSaturn, distSunSaturn, speedSaturn } from "../values/measurements";
import SaturnSurface from "./surfaces/saturn.jpg"
import SaturnRing from "./surfaces/saturn_ring.png"
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";


import { useFrame } from "@react-three/fiber";
import { useRef } from "react"

export const Saturn = ({ sunRef }) => {

    const texture = useLoader(TextureLoader, SaturnSurface);
    const ringTexture = useLoader(TextureLoader, SaturnRing);

    const planetRef = useRef();
    const ringRef = useRef();

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        let theta = speedSaturn * (time) * Math.PI ;
        planetRef.current.rotation.y = planetRef.current.rotation.y + 0.002
        planetRef.current.position.x = sunRef.current.position.x + (distSunSaturn * (Math.sin(theta)));
        planetRef.current.position.y = sunRef.current.position.y + -(distSunSaturn * (Math.cos(theta)));
        planetRef.current.position.z = sunRef.current.position.z + (distSunSaturn*(Math.cos(theta)));
        ringRef.current.position.x = sunRef.current.position.x + (distSunSaturn * (Math.sin(theta)));
        ringRef.current.position.y = sunRef.current.position.y + -(distSunSaturn * (Math.cos(theta)));
        ringRef.current.position.z = sunRef.current.position.z + (distSunSaturn*(Math.cos(theta)));
    })

    return (
        <>
            <mesh ref={planetRef} >
                <sphereBufferGeometry args={[sizeSaturn]} />
                <meshBasicMaterial attach="material" map={texture} />
            </mesh>
            <mesh ref={ringRef} >
                <torusBufferGeometry args={[sizeSaturn*1.3, 3, 2, 40 ]} />
                <meshBasicMaterial attach="material" map={ringTexture} />
            </mesh>
        </>
    )

}