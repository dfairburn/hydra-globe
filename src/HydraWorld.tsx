import React, { useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  let root;

  useEffect(() => {
    console.log("foo");
    root = document.getElementById("hydra-world-root")
    console.log(root)

    scene.add( cube );
    camera.position.z = 5;
    renderer.autoClear = false;
    if (root) {
      root.appendChild(renderer.domElement);
    }
  });

  useEffect(() => {
    animate();
  }, [root, scene, camera])

  const animate = () => {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera)
  }


  return (
      <div id={"hydra-world-root"}/>
  );
};