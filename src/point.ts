import * as THREE from 'three';

const RADIUS = 3.1;

export const Point = (lat: any, lon: any): THREE.Mesh => {
    const pointGeometry = new THREE.SphereGeometry( 0.1, 64, 64 );
    const pointMaterial = new THREE.MeshStandardMaterial( {color: 0xbb43d9})
    const point = new THREE.Mesh( pointGeometry, pointMaterial );

    const r = RADIUS
    const phi = (90-lat) * (Math.PI/180);
    const theta = (lon+180) * (Math.PI/180);

    const px = r * Math.sin(phi) * Math.cos(theta);
    const py = r * Math.sin(phi) * Math.sin(theta);
    const pz = r * Math.cos(phi);

    point.position.setX(-px)
    point.position.setY(pz)
    point.position.setZ(py)

    return point
}