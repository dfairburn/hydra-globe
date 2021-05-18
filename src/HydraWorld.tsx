import React, { useState, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { Point } from './point';
import { Curve } from './curve';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const [rotation, setRotation] = useState(0);
  const fixture = require('./fixtures/sample_data.json')
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer( { alpha: true });
  const light = new THREE.PointLight( 0xffffff, 1, 100 );
  const sphereGeometry = new THREE.SphereGeometry( 3, 64, 64 );
  const haloGeometry = new THREE.SphereGeometry( 3.1, 64, 64 );
  const alphaImg = require("./img/earth_alpha.jpg")
  const alphaTex = new THREE.TextureLoader().load( alphaImg );
  const img = require("./img/lo-res-dot-map.png")
  const tex = new THREE.TextureLoader().load( img );
  const ambLight = new THREE.AmbientLight( 0x404040, 5 ); // soft white light
  const globeMaterial = new THREE.MeshStandardMaterial({ map: tex, alphaMap: alphaTex, transparent: true })
  const haloMaterial = new THREE.MeshPhongMaterial( { color: 1, opacity: 0.05, transparent: true, side: THREE.BackSide, emissive: 0xff, emissiveIntensity: 10})

  const sphere = new THREE.Mesh( sphereGeometry, globeMaterial );
  const halo = new THREE.Mesh( haloGeometry, haloMaterial );
  let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera;
  let controls: OrbitControls;


  sphere.castShadow = true; //default is false
  sphere.receiveShadow = false; //default

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  light.position.set( 5, 5, 5);
  light.castShadow = true

  renderer.setPixelRatio( window.devicePixelRatio );

  scene.add( light );
  scene.add( ambLight );
  scene.add( sphere );
  scene.add( halo );

  fixture.forEach((d: any) => {
    const from = Point(d.coord.from.lat, d.coord.from.lon)
    const to = Point(d.coord.to.lat, d.coord.to.lon)
    const curve = Curve(d.coord.from, d.coord.to)
    scene.add(from)
    scene.add(to)
    scene.add(curve)
  })

  useEffect(() => {
    const root = document.getElementById("hydra-world-root");
    if (root === null) return

    if (!root.hasChildNodes()) {
      const {width, height} = root.getBoundingClientRect()
      renderer.setSize(width, height);
      camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 10000 );
      camera.position.z = 10;
      controls = new OrbitControls (camera, renderer.domElement);
      root.appendChild(renderer.domElement);
    } else {
      const {width, height} = root.getBoundingClientRect()
      camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 10000 );
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