import React, { useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer( { alpha: true });
  const light = new THREE.PointLight( 0xffffff, 1, 100 );
  const sphereGeometry = new THREE.SphereGeometry( 3, 64, 64 );
  const haloGeometry = new THREE.SphereGeometry( 3.1, 64, 64 );
  const globeImg = require("./img/globe.jpg")
  const texture = new THREE.TextureLoader().load( globeImg );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const globeMaterial = new THREE.MeshStandardMaterial( {map: texture, opacity: 0.5, transparent: true })
  const haloMaterial = new THREE.MeshPhongMaterial( { color: 1, opacity: 0.05, transparent: true, side: THREE.BackSide, emissive: 0xff, emissiveIntensity: 10})
  const rimLight = new THREE.PointLight( 0xffffff, 2, 100 );
  const ambientLight = new THREE.PointLight( 0xffffff, 0.25, 100 );

  const sphere = new THREE.Mesh( sphereGeometry, globeMaterial );
  sphere.rotation.y = -1.5;
  const halo = new THREE.Mesh( haloGeometry, haloMaterial );
  let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera;
  let controls: OrbitControls;


  sphere.castShadow = true; //default is false
  sphere.receiveShadow = false; //default

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  light.position.set( 5, 5, 5);
  light.castShadow = true
  rimLight.position.set(-5, -5, 0);
  rimLight.castShadow = true
  ambientLight.position.set(-5, 2, 5);
  ambientLight.castShadow = true

  renderer.setPixelRatio( window.devicePixelRatio );

  scene.add( light );
  scene.add( rimLight );
  scene.add( ambientLight );
  scene.add( sphere );
  scene.add( halo );

  const pointGeometry = new THREE.SphereGeometry( 0.1, 64, 64 );
  const pointMaterial = new THREE.MeshStandardMaterial( {color: 0xbb43d9})
  const point = new THREE.Mesh( pointGeometry, pointMaterial );

  const r = 3.1
  const px = r * Math.cos(0.0) * Math.sin(0.0)
  const py = r * Math.sin(0.0) * Math.sin(0.0)
  const pz = r * Math.cos(0.0)
  point.position.setX(px)
  point.position.setY(py)
  point.position.setZ(pz)

  scene.add(point);


  useEffect(() => {
    const root = document.getElementById("hydra-world-root");
    if (root === null) return

    if (!root.hasChildNodes()) {
      const {width, height} = root.getBoundingClientRect()
      renderer.setSize(width, height);
      camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 1000 );
      camera.position.z = 10;
      controls = new OrbitControls (camera, renderer.domElement);
      root.appendChild(renderer.domElement);
    } else {
      const {width, height} = root.getBoundingClientRect()
      camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 1000 );
      camera.position.z = 10;
      controls = new OrbitControls (camera, renderer.domElement);
      renderer.setSize(width, height);
      root.replaceChild(renderer.domElement, root.childNodes[0]);
    }

  });

  useEffect(() => {
    animate();
  }, [scene, camera, sphere])

  const animate = () => {
    controls.update();

    requestAnimationFrame( animate );

    // sphere.rotateY(0.001)

    renderer.render( scene, camera );
  }


  return (
      <div 
      id={"hydra-world-root"}
      style={{
        height: "inherit",
        width: "inherit"
      }}
      />
  );
};