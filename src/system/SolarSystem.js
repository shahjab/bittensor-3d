import { useEffect, useRef, useState } from "react"
import { Earth } from "./planets/Earth";
import Sun from "./sun";

export const SolarSystem = ({planets, position, radius, onSelect}) => {
    const [zRotation, setZRotation] = useState();
    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }
    const sunRef = useRef();
    useEffect(() => {
        setZRotation(getRandom(0,2))
        onSelect(position);
    }, [])

    return (
        <>
            <Sun sunRef={sunRef} position={position} radius={radius} onClick={(v) => {onSelect(v)}}/>
            { planets.map((miner, index) => 
                <Earth key={index} sunRef={sunRef} distance={miner.distance} zRotation={zRotation}/>
            )}
        </>
    )
}