import * as THREE from 'three';
import { SELECTABLE } from 'types';
import { plotPoints } from './point';

export const Curve = (data: any, threshold: number) => {
  const from = data.coord.from;
  const to = data.coord.to;
  const [fx, fy, fz] = plotPoints(from.lat, from.lon, 3);
  const [tx, ty, tz] = plotPoints(to.lat, to.lon, 3);

  let dist = Math.pow(fx - tx, 2) + Math.pow(fy - ty, 2) + Math.pow(fz - tz, 2);
  if (dist < 3.15) {
    dist = 3.15;
  }
  if (dist > 4) {
    dist = 4;
  }
  const [c1x, c1y, c1z] = plotPoints(from.lat, from.lon, dist);
  const [c2x, c2y, c2z] = plotPoints(to.lat, to.lon, dist);

  const curvePts = new THREE.CubicBezierCurve3(
    new THREE.Vector3(fx, fy, fz),
    new THREE.Vector3(c1x, c1y, c1z),
    new THREE.Vector3(c2x, c2y, c2z),
    new THREE.Vector3(tx, ty, tz)
  );
  const points = curvePts.getPoints(50);
  let curveMat;
  let alerting;
  const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
  if (data.value < threshold) {
    curveMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 1 });
    alerting = true
  } else {
    curveMat = new THREE.LineBasicMaterial({ color: 0x7659c0, linewidth: 0.1 });
    alerting = false
  }
  const curve = new THREE.Line(curveGeo, curveMat);
  const dataString = `Metric: ${data.metric} | Value: ${data.value} | Label: ${data.name}`;
  const userData = { ...SELECTABLE, data: dataString, alerting: alerting };
  curve.userData = userData;
  return curve;
};
