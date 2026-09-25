import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import world from 'world-atlas/countries-110m.json';
import { feature, mesh } from 'topojson-client';

function latLonToVector3(lat, lon, radius = 2.05) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function project(lon, lat, width, height) {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function drawRing(ctx, ring, width, height) {
  if (!ring.length) return;
  ring.forEach(([lon, lat], index) => {
    const [x, y] = project(lon, lat, width, height);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
}

function drawPolygon(ctx, coordinates, width, height) {
  coordinates.forEach((ring) => drawRing(ctx, ring, width, height));
}

function drawGeometry(ctx, geometry, width, height) {
  ctx.beginPath();
  if (geometry.type === 'Polygon') {
    drawPolygon(ctx, geometry.coordinates, width, height);
  }
  if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon) => drawPolygon(ctx, polygon, width, height));
  }
}

const countriesFeature = feature(world, world.objects.countries);
const bordersMesh = mesh(world, world.objects.countries, (a, b) => a !== b);

function makeEarthTexture(theme) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const ocean = ctx.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, theme.darkness > 0.4 ? '#07152c' : '#0d64a5');
  ocean.addColorStop(0.55, theme.darkness > 0.4 ? '#0a2142' : '#1b84c4');
  ocean.addColorStop(1, theme.darkness > 0.4 ? '#050b19' : '#0d3d72');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  countriesFeature.features.forEach((country, index) => {
    drawGeometry(ctx, country.geometry, width, height);
    const hue = theme.darkness > 0.4 ? 142 + (index % 5) * 7 : 96 + (index % 6) * 8;
    const sat = theme.darkness > 0.4 ? 28 : 43;
    const light = theme.darkness > 0.4 ? 27 + (index % 4) * 4 : 41 + (index % 4) * 5;
    ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
    ctx.fill('evenodd');
  });

  ctx.strokeStyle = theme.darkness > 0.4 ? 'rgba(205, 238, 224, 0.48)' : 'rgba(18, 54, 44, 0.52)';
  ctx.lineWidth = 1.25;
  countriesFeature.features.forEach((country) => {
    drawGeometry(ctx, country.geometry, width, height);
    ctx.stroke();
  });

  ctx.strokeStyle = theme.darkness > 0.4 ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 0.8;
  for (let lon = -180; lon <= 180; lon += 30) {
    ctx.beginPath();
    const [x] = project(lon, 0, width, height);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    const [, y] = project(0, lat, width, height);
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function makeBorderLines() {
  const positions = [];
  const lines = bordersMesh.coordinates || [];
  lines.forEach((line) => {
    for (let i = 1; i < line.length; i += 1) {
      const [lonA, latA] = line[i - 1];
      const [lonB, latB] = line[i];
      if (Math.abs(lonA - lonB) > 180) continue;
      const a = latLonToVector3(latA, lonA, 2.012);
      const b = latLonToVector3(latB, lonB, 2.012);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

export default function Globe({ countries, selectedCountry, meal, onSelectCountry }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2, 128, 128),
      new THREE.MeshStandardMaterial({ map: makeEarthTexture(meal), roughness: 0.68, metalness: 0.01 })
    );
    group.add(earth);

    const borderLines = new THREE.LineSegments(
      makeBorderLines(),
      new THREE.LineBasicMaterial({ color: meal.darkness > 0.4 ? '#c8f7e4' : '#0c382f', transparent: true, opacity: 0.52 })
    );
    group.add(borderLines);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.08, 96, 96),
      new THREE.MeshBasicMaterial({ color: meal.glow, transparent: true, opacity: 0.1, side: THREE.BackSide })
    );
    group.add(atmosphere);

    const ambient = new THREE.AmbientLight('#ffffff', 0.82 - meal.darkness * 0.35);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(meal.glow, 2.05);
    sun.position.set(-3.5, 2.3, 5);
    scene.add(sun);

    const pointMeshes = countries.map((country) => {
      const position = latLonToVector3(country.lat, country.lon, 2.08);
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(country.id === selectedCountry.id ? 0.075 : 0.045, 24, 24),
        new THREE.MeshBasicMaterial({ color: country.id === selectedCountry.id ? '#ffffff' : country.color })
      );
      marker.position.copy(position);
      marker.userData = { country };
      group.add(marker);
      return marker;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const drag = { active: false, startX: 0, startY: 0, x: 0, y: 0 };

    const pointerPosition = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.touches?.[0]?.clientX ?? event.clientX;
      const clientY = event.touches?.[0]?.clientY ?? event.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top, rect };
    };

    const onDown = (event) => {
      const pos = pointerPosition(event);
      drag.active = true;
      drag.startX = pos.x;
      drag.startY = pos.y;
      drag.x = pos.x;
      drag.y = pos.y;
    };
    const onMove = (event) => {
      if (!drag.active) return;
      const pos = pointerPosition(event);
      group.rotation.y += (pos.x - drag.x) * 0.006;
      group.rotation.x += (pos.y - drag.y) * 0.004;
      group.rotation.x = Math.max(-0.8, Math.min(0.8, group.rotation.x));
      drag.x = pos.x;
      drag.y = pos.y;
    };
    const onUp = (event) => {
      const pos = pointerPosition(event);
      const moved = Math.abs(pos.x - drag.startX) + Math.abs(pos.y - drag.startY);
      drag.active = false;
      pointer.x = (pos.x / pos.rect.width) * 2 - 1;
      pointer.y = -(pos.y / pos.rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pointMeshes)[0];
      if (hit && moved < 12) onSelectCountry(hit.object.userData.country);
    };

    renderer.domElement.addEventListener('mousedown', onDown);
    renderer.domElement.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    renderer.domElement.addEventListener('touchstart', onDown, { passive: true });
    renderer.domElement.addEventListener('touchmove', onMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onUp);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!drag.active) group.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    stateRef.current = { earth, borderLines, atmosphere, ambient, sun, pointMeshes };
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onUp);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    if (!state.earth) return;
    state.earth.material.map = makeEarthTexture(meal);
    state.earth.material.needsUpdate = true;
    state.borderLines.material.color.set(meal.darkness > 0.4 ? '#c8f7e4' : '#0c382f');
    state.borderLines.material.opacity = meal.darkness > 0.4 ? 0.58 : 0.48;
    state.atmosphere.material.color.set(meal.glow);
    state.atmosphere.material.opacity = meal.darkness > 0.4 ? 0.18 : 0.1;
    state.ambient.intensity = 0.82 - meal.darkness * 0.35;
    state.sun.color.set(meal.glow);
  }, [meal]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state.pointMeshes) return;
    state.pointMeshes.forEach((marker) => {
      const isSelected = marker.userData.country.id === selectedCountry.id;
      marker.material.color.set(isSelected ? '#ffffff' : marker.userData.country.color);
      marker.scale.setScalar(isSelected ? 1.65 : 1);
    });
  }, [selectedCountry]);

  return <div className="globeMount" ref={mountRef} />;
}
