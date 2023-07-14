import { NoRingPlanet } from "./template/NoRingPlanet";
import { sizeVenus, distSunVenus, speedVenus } from "../values/measurements";
import VenusSurface from "./surfaces/venus.jpg"
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

export const Venus = ({ sunRef }) => {

    const texture = useLoader(TextureLoader, VenusSurface);

    return (
        <>
            <NoRingPlanet sunRef={sunRef} distanceFromSun={distSunVenus} radius={sizeVenus} speedCoeff={speedVenus} texture={texture} />
        </>
    )

}