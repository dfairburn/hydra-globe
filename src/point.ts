import * as THREE from 'three';

const RADIUS = 3;

export const Point = (lat: any, lon: any, name: any): THREE.Mesh => {
    const pointGeometry = new THREE.SphereGeometry( 0.01, 8, 8 );
    const pointMaterial = new THREE.MeshStandardMaterial( {color: 0xbb43d9})
    const point = new THREE.Mesh( pointGeometry, pointMaterial );

    const [px, py, pz] = plotPoints(lat, lon, RADIUS)

    point.position.setX(px)
    point.position.setY(py)
    point.position.setZ(pz)
    point.name = name

    return point
}

export const plotPoints = (lat: any, lon: any, rad: any) => {
    const phi = (90-lat) * (Math.PI/180);
    const theta = (lon+180) * (Math.PI/180);

    const px = -(rad * Math.sin(phi) * Math.cos(theta));
    const py = rad * Math.cos(phi);
    const pz = rad * Math.sin(phi) * Math.sin(theta);

    return [px, py, pz]
}