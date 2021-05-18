import React, { useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer( { alpha: true });
  const light = new THREE.PointLight( 0xff0000, 1, 100 );
  const sphereGeometry = new THREE.SphereGeometry( 2, 32, 32 );
  const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
  const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
  let camera: THREE.PerspectiveCamera;

  sphere.castShadow = true; //default is false
  sphere.receiveShadow = false; //default

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  light.position.set( 5, 5, 5);
  light.castShadow = true

  renderer.setPixelRatio( window.devicePixelRatio );

  scene.add( light );
  scene.add( sphere );


  useEffect(() => {
    const root = document.getElementById("hydra-world-root");
    if (root === null) return

    if (!root.hasChildNodes()) {
      const {width, height} = root.getBoundingClientRect()
      renderer.setSize(width, height);
      camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
      camera.position.z = 5;
      root.appendChild(renderer.domElement);
    } else {
      const {width, height} = root.getBoundingClientRect()
      camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
      camera.position.z = 5;
      renderer.setSize(width, height);
      root.replaceChild(renderer.domElement, root.childNodes[0]);
    }
    animate();
  });

  const animate = () => {
    requestAnimationFrame( animate );
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