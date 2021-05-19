import { plotPoints } from 'point';
import * as THREE from 'three';

const RADIUS = 3;

export const Alert = (lat: any, lon: any, center: any): THREE.Mesh => {
  const alertGeometry = new THREE.TorusGeometry(0.05, 0.01, 16, 100);
  const alertMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
  const alert = new THREE.Mesh(alertGeometry, alertMaterial);
  alert.name = 'alert';

  const [px, py, pz] = plotPoints(lat, lon, RADIUS + 0.01);

  alert.position.setX(px);
  alert.position.setY(py);
  alert.position.setZ(pz);

  alert.lookAt(0, 0, 0);
  return alert;
};
