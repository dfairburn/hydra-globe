import * as THREE from 'three';
import { plotPoints } from './point';

export const Curve = (from: any, to: any) => {

    const [fx, fy, fz] = plotPoints(from.lat, from.lon, 3)
    const [tx, ty, tz] = plotPoints(to.lat, to.lon, 3)

    const dist = (Math.pow(fx - tx, 2) + Math.pow(fy - ty, 2) + Math.pow(fz - tz, 2))
    let radDist = dist / 3.5 + 3
    if (radDist > 4) {
        radDist = 4;
    }
    console.log("Dist: ", dist)
    console.log("rad Dist: ", radDist)
    const [c1x, c1y, c1z] = plotPoints(from.lat, from.lon, radDist)
    const [c2x, c2y, c2z] = plotPoints(to.lat, to.lon, radDist)

    const curvePts = new THREE.CubicBezierCurve3(
      new THREE.Vector3( fx, fy, fz ),
      new THREE.Vector3( c1x, c1y, c1z),
      new THREE.Vector3( c2x, c2y, c2z),
      new THREE.Vector3( tx, ty, tz ),

    );
    const points = curvePts.getPoints( 50 );
    const curveGeo = new THREE.BufferGeometry().setFromPoints( points )
    const curveMat = new THREE.LineBasicMaterial( {color: 0xd52685 } );
    return new THREE.Line(curveGeo, curveMat)
}