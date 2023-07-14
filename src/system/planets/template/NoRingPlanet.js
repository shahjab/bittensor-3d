import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react"

import { Ring } from "@react-three/drei";
import * as THREE from 'three';

export const NoRingPlanet = ({ sunRef, distanceFromSun, radius = 10, speedCoeff = 1, texture, zRotation=0 }) => {

    const [spd, setSpd] = useState(0);
    const [isHover, setHover] = useState(false);
    useEffect(() => {
        setSpd(getRandom(0.2,1));
    }, [])

    const planetRef = useRef();

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        let theta = spd * (time) * Math.PI;
        // planetRef.current.rotation.y = planetRef.current.rotation.y + 0.002
        planetRef.current.position.x = sunRef.current.position.x + (distanceFromSun * (Math.sin(theta)));
        planetRef.current.position.y = sunRef.current.position.y + -(distanceFromSun * (Math.cos(theta)));
        planetRef.current.position.z = sunRef.current.position.z //+ (distanceFromSun * (Math.cos(zRotation)));
    })

    const MeshToRender = () => {
        if (texture == null) {
            return (
                <meshPhongMaterial color="red" />
            );
        } else {
            return (
                <meshBasicMaterial attach="material" map={texture} />
            );
        }
    }

    return (
        <>
            <mesh ref={planetRef} position={distanceFromSun}  onPointerMove={() => { setHover(true) }} onPointerLeave={() => { setHover(false)}}>
                <sphereBufferGeometry args={[radius]} />
                <MeshToRender />
            </mesh>
            <Ring args={[distanceFromSun, distanceFromSun + 2, 64]} position={[sunRef.current.position.x, sunRef.current.position.y , sunRef.current.position.z]} rotateZ={zRotation} onPointerMove={() => { setHover(true) }} onPointerLeave={() => { setHover(false)}}>
                <meshBasicMaterial attach="material" color={ isHover ? "red" : "white" } side={THREE.DoubleSide} />
            </Ring>
        </>

    )
}