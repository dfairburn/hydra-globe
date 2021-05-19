import React, { useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions, UNSELECTABLE } from 'types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Point } from './point';
import { Curve } from './curve';
import { Alert } from 'alert';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const { spin, threshold } = options;
  const fixture = require('./fixtures/sample_data.json');
  const img = require('./img/lo-res-dot-map.png');
  const alphaImg = require('./img/earth_alpha.jpg');
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const light = new THREE.PointLight(0xffffff, 1, 100);
  const sphereGeometry = new THREE.SphereGeometry(3, 64, 64);
  const haloGeometry = new THREE.SphereGeometry(3.1, 64, 64);
  const alphaTex = new THREE.TextureLoader().load(alphaImg);
  const tex = new THREE.TextureLoader().load(img);
  const ambLight = new THREE.AmbientLight(0x404040, 6); // soft white light
  const globeMaterial = new THREE.MeshStandardMaterial({ map: tex, alphaMap: alphaTex, transparent: true });
  const backMaterial = new THREE.MeshStandardMaterial({ color: 0x1f1537, alphaMap: alphaTex, side: THREE.BackSide });
  const haloMaterial = new THREE.MeshPhongMaterial({
    color: 1,
    opacity: 0.05,
    transparent: true,
    side: THREE.BackSide,
    emissive: 0xff,
    emissiveIntensity: 10,
  });
  let theta = 0;
  let INTERSECTED: any;
  let labeled = false;

  sphereGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.5);
  haloGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.5);

  const sphere = new THREE.Mesh(sphereGeometry, globeMaterial);
  const backSphere = new THREE.Mesh(sphereGeometry, backMaterial);
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  backSphere.userData = UNSELECTABLE;
  halo.userData = UNSELECTABLE;
  sphere.userData = UNSELECTABLE;
  let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  let controls: OrbitControls;

  sphere.castShadow = true; //default is false
  sphere.receiveShadow = false; //default

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  light.position.set(5, 5, 5);
  light.castShadow = true;

  renderer.setPixelRatio(window.devicePixelRatio);

  scene.add(light);
  scene.add(backSphere);
  scene.add(ambLight);
  scene.add(sphere);
  scene.add(halo);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltipMouse = new THREE.Vector2();
  window.addEventListener('mousemove', onMouseMove, false);

  function onMouseMove(event: any) {
    const root = document.getElementById('hydra-world-root');
    if (root) {
      mouse.x = ((event.clientX - root.offsetLeft) / root.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - root.offsetTop) / root.clientHeight) * 2 + 1;
    }
    tooltipMouse.x = event.clientX;
    tooltipMouse.y = event.clientY;
  }

  fixture.forEach((d: any) => {
    const from = Point(d.coord.from.lat, d.coord.from.lon, d.name);
    const to = Point(d.coord.to.lat, d.coord.to.lon, d.name);

    const curve = Curve(d, threshold);
    console.log(threshold);
    if (d.value < threshold) {
      const fromAlert = Alert(d.coord.from.lat, d.coord.from.lon, scene.position);
      const toAlert = Alert(d.coord.to.lat, d.coord.to.lon, scene.position);
      scene.add(fromAlert);
      scene.add(toAlert);
    }
    scene.add(from);
    scene.add(to);
    scene.add(curve);
  });

  useEffect(() => {
    const root = document.getElementById('hydra-world-root');
    if (root === null) {
      return;
    }

    if (!root.hasChildNodes()) {
      updateSizes();
      root.appendChild(renderer.domElement);
    } else {
      updateSizes();
      root.replaceChild(renderer.domElement, root.childNodes[0]);
    }
  });

  const updateSizes = () => {
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.z = 6.5;
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    // controls.enableZoom = false;
    controls.enableDamping = true;
    controls.minPolarAngle = Math.PI / 2 - 0.75;
    controls.maxPolarAngle = Math.PI / 2 + 0.75;

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    renderer.setSize(width, height);
  };

  useEffect(() => {
    render();
  }, [scene, camera, sphere]);

  const hover = () => {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0 && intersects[0].object.userData.selectable) {
      if (INTERSECTED !== intersects[0].object) {
        if (INTERSECTED) {
          INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        }
        if (intersects[0].object.visible) {
          if (!labeled) {
            let text = document.createElement('div');
            text.id = 'tooltip';
            text.style.position = 'absolute';
            text.style.width = '100';
            text.style.height = '100';
            if (intersects[0].object.userData.alerting === true) {
              text.style.color = 'red';
            } else {
              text.style.color = 'white';
            }
            text.innerHTML = intersects[0].object.userData.data;
            text.style.top = tooltipMouse.y + 'px';
            text.style.left = tooltipMouse.x + 'px';
            document.body.appendChild(text);
            labeled = true;
          }
        }

        INTERSECTED = intersects[0].object;
        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
        console.log(INTERSECTED);
        if (INTERSECTED.userData.alerting === true) {
          INTERSECTED.material.color.setHex(0xffffff);
        } else {
          INTERSECTED.material.color.setHex(0x00ff00);
        }
      }
    } else {
      if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      }
      document.getElementById('tooltip')?.remove();
      labeled = false;
      INTERSECTED = null;
    }
  };

  const alerts = scene.children.filter((obj: any) => obj.name === 'alert');
  console.log(alerts);
  const clock = new THREE.Clock();
  const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 2], [1, 0]);
  const scaleKF = new THREE.VectorKeyframeTrack('.scale', [0, 2], [0, 0, 0, 3, 3, 3]);
  // const radiusKF = new THREE.NumberKeyframeTrack(".geometry.parameters.radius", [0, 1, 2, 3, 4], [0, 0.1, 0.2, 0.4, 0.5])
  // const tubeKF = new THREE.NumberKeyframeTrack(".geometry.parameters.tube", [0, 1, 2, 3, 4], [0.3, 0.25, 0.2, 0.15, 0.1])
  const clip = new THREE.AnimationClip('blink', -1, [opacityKF, scaleKF]);
  const animGroup = new THREE.AnimationObjectGroup();
  alerts.forEach((obj: any) => animGroup.add(obj));
  const mixer = new THREE.AnimationMixer(animGroup);
  const action = mixer.clipAction(clip);
  action.play();

  const render = () => {
    requestAnimationFrame(render);
    const delta = clock.getDelta();
    if (spin) {
      theta += 0.01;
      camera.position.x = 10 * Math.sin(THREE.MathUtils.degToRad(theta));
      camera.lookAt(scene.position);
    }

    if (mixer) {
      mixer.update(delta);
    }

    controls.update();
    hover();
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  return (
    <>
      <div
        id={'hydra-world-root'}
        style={{
          height: 'inherit',
          width: 'inherit',
        }}
      />
    </>
  );
};
