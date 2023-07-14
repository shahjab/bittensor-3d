import { NoRingPlanet } from "./template/NoRingPlanet";
import { sizeUranus, distSunUranus, speedUranus } from "../values/measurements";
import UranusSurface from "./surfaces/uranus.jpg"
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

export const Uranus = ({ sunRef }) => {

    const texture = useLoader(TextureLoader, UranusSurface);

    return (
        <>
            <NoRingPlanet sunRef={sunRef} distanceFromSun={distSunUranus} radius={sizeUranus} speedCoeff={speedUranus} texture={texture} />
        </>
    )

}