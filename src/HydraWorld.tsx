import React, { useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions, UNSELECTABLE } from 'types';
import * as THREE from 'three';
// import * as THREEx from './js/threex.domevents.js'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { Point } from './point';
import { Curve } from './curve';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const {spin} = options
  const fixture = require('./fixtures/sample_data.json')
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true });
  const light = new THREE.PointLight( 0xffffff, 1, 100 );
  const sphereGeometry = new THREE.SphereGeometry( 3, 64, 64 );
  const haloGeometry = new THREE.SphereGeometry( 3.1, 64, 64 );
  const alphaImg = require("./img/earth_alpha.jpg")
  const alphaTex = new THREE.TextureLoader().load( alphaImg );
  const img = require("./img/lo-res-dot-map.png")
  const tex = new THREE.TextureLoader().load( img );
  const ambLight = new THREE.AmbientLight( 0x404040, 6 ); // soft white light
  const globeMaterial = new THREE.MeshStandardMaterial({ map: tex, alphaMap: alphaTex, transparent: true })
  const backMaterial = new THREE.MeshStandardMaterial({ color: 0x1f1537, alphaMap: alphaTex, side: THREE.BackSide})
  const haloMaterial = new THREE.MeshPhongMaterial( { color: 1, opacity: 0.05, transparent: true, side: THREE.BackSide, emissive: 0xff, emissiveIntensity: 10})
  let theta = 0;
  let INTERSECTED: any;

  const sphere = new THREE.Mesh( sphereGeometry, globeMaterial );
  const backSphere = new THREE.Mesh( sphereGeometry, backMaterial );
  const halo = new THREE.Mesh( haloGeometry, haloMaterial );
  backSphere.userData = UNSELECTABLE
  halo.userData = UNSELECTABLE
  sphere.userData = UNSELECTABLE
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
  scene.add( backSphere );
  scene.add( ambLight );
  scene.add( sphere );
  scene.add( halo );

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener( 'mousemove', onMouseMove, false );

  function onMouseMove( event: any ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    const root = document.getElementById("hydra-world-root");
    if (root) {
      mouse.x = ( ( event.clientX - root.offsetLeft ) / root.clientWidth ) * 2 - 1;
      mouse.y = - ( ( event.clientY - root.offsetTop ) / root.clientHeight ) * 2 + 1;
    }

  }


  fixture.forEach((d: any) => {
    const from = Point(d.coord.from.lat, d.coord.from.lon, d.name)
    const to = Point(d.coord.to.lat, d.coord.to.lon, d.name)

    const curve = Curve(d.coord.from, d.coord.to)
    scene.add(from)
    scene.add(to)
    scene.add(curve)
  })

  useEffect(() => {
    const root = document.getElementById("hydra-world-root");
    if (root === null) return

    if (!root.hasChildNodes()) {
      updateSizes()
      root.appendChild(renderer.domElement);
    } else {
      updateSizes()
      root.replaceChild(renderer.domElement, root.childNodes[0]);
    }
  });

  const updateSizes = () => {
      camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 10000 );
      camera.position.z = 10;
      controls = new OrbitControls (camera, renderer.domElement);
      controls.enablePan = false
      controls.enableZoom = false
      controls.enableDamping = true
      controls.minPolarAngle = Math.PI/2 - 0.15;
      controls.maxPolarAngle = Math.PI/2 + 0.15;

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
  }

  useEffect(() => {
    render();
  }, [scene, camera, sphere])



  const render = () => {
    controls.update();

    console.log(camera.rotation)
    requestAnimationFrame( render );
    if (spin) {
      theta += 0.01;
      camera.position.x = 10 * Math.sin( THREE.MathUtils.degToRad( theta ) );
      camera.lookAt( scene.position );
      camera.updateMatrixWorld();
    }

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children )
    .filter((obj: any) => obj.object.userData.selectable)


    if ( intersects.length > 0 ) {

      if ( INTERSECTED != intersects[ 0 ].object ) {

        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

        INTERSECTED = intersects[ 0 ].object;
        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
        INTERSECTED.material.color.setHex( 0x00ff00 );

      }

    } else {

      if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

      INTERSECTED = null;

    }
    
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