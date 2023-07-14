import { NoRingPlanet } from "./template/NoRingPlanet";
import { sizeMars, distSunMars, speedMars } from "../values/measurements";
import MarsSurface from "./surfaces/mars.jpg"
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

export const Mars = ({ sunRef }) => {

    const texture = useLoader(TextureLoader, MarsSurface);

    return (
        <>
            <NoRingPlanet sunRef={sunRef} distanceFromSun={distSunMars} radius={sizeMars} speedCoeff={speedMars} texture={texture} />
        </>
    )

}