import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw } from 'lucide-react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import cardUrl from '../../assets/card/card.glb?url';
import atlasUrl from '../../assets/card/atlas.jpg';
import strapUrl from '../../assets/card/strap.png';
import photo from '../../assets/image_c70791.png';
import { scrollState } from '../../lib/scroll.js';
import { markCardReady, useBooted } from '../../lib/boot.js';

extend({ MeshLineGeometry, MeshLineMaterial });

// El modelo se decodifica a mano: así no depende de fetch() (algunas extensiones o navegadores lo rompen con data: URLs
// en el build de un solo archivo: "Could not load data:model/gltf-binary…").
function toBuffer(url) {
  if (url.startsWith('data:')) {
    const bin = atob(url.slice(url.indexOf(',') + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return Promise.resolve(bytes.buffer);
  }
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error('No se pudo cargar el modelo del carné');
    return r.arrayBuffer();
  });
}
let cardPromise;
function loadCard() {
  if (!cardPromise) {
    cardPromise = toBuffer(cardUrl)
      .then((buf) => new Promise((res, rej) => new GLTFLoader().parse(buf, '', res, rej)))
      .then((gltf) => {
        const nodes = {};
        gltf.scene.traverse((o) => {
          if (o.name) nodes[o.name] = o;
        });
        const p = cardPromise;
        p.status = 'ok';
        p.value = { nodes };
        return p.value;
      })
      .catch((e) => {
        cardPromise.status = 'err';
        cardPromise.error = e;
        throw e;
      });
  }
  return cardPromise;
}
function useCardModel() {
  const p = loadCard();
  if (p.status === 'ok') return p.value;
  if (p.status === 'err') throw p.error;
  throw p;
}
loadCard().catch(() => {});

const ANCHOR = [0, 3.1, 0]; // por encima del borde superior visible: la cinta "entra" desde fuera de la escena
const MAX_REACH = 4.2; // largo máximo cinta + carné; evita estirarla al arrastrar
const SCROLL_KICK = 0.0011; // cuánto balancea el scroll (por px de velocidad)

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const media = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Carné estático (sin WebGL o mientras carga): mismos datos y tokens que el 3D. */
export function LanyardFallback() {
  return (
    <div className="absolute inset-0 flex justify-center overflow-hidden" aria-hidden>
      <div className="absolute top-0 h-[22%] w-[52px] bg-bg-2" style={{ borderInline: '3px solid var(--gold)' }} />
      <div
        className="relative mt-[18%] h-fit w-[min(260px,62%)] rotate-[-2deg] rounded-[22px] border border-line bg-bg-2 p-5"
        style={{ boxShadow: '0 30px 60px -30px rgba(0,0,0,.8)' }}
      >
        <img src={photo} alt="" className="aspect-[227/314] w-full rounded-[14px] object-cover object-top grayscale" draggable={false} />
        <p className="font-display mt-4 text-[1.35rem] font-semibold leading-none tracking-tight text-fg">Frank Pineda</p>
        <p className="mt-1.5 text-[0.85rem] text-fg-2">Full-Stack Software Engineer</p>
        <span className="mt-4 block h-[3px] w-10 rounded bg-gold" />
        <p className="mt-3 text-[0.8rem] text-fg-3">Ica, Perú</p>
      </div>
    </div>
  );
}

function Band({ visible, reduced, onGrab, nudgeRef, onReady, flipTick, onSide, onFlip, full, booted }) {
  const face = useRef();
  const spin = useRef({ v: 0, x: 0, target: 0 }); // resorte del giro: x = ángulo, v = velocidad
  const press = useRef(null);
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const smooth = useRef(0);
  const mode = useRef('free'); // 'free' (física) | 'drag' (sigue al puntero) | 'return' (vuelve al alcance de la cinta)
  const pos = useRef(new THREE.Vector3());
  const vel = useRef(new THREE.Vector3());
  const last = useRef({ t: 0, flip: 0 });
  const intro = useRef(false);
  const dragged = useRef(null);
  const { nodes } = useCardModel();
  const [atlas, strap] = useTexture([atlasUrl, strapUrl]);
  const gl = useThree((s) => s.gl);
  const { width, height } = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.viewport);

  const [anchor] = useState(() => (full ? [viewport.width * 0.3, viewport.height / 2 + 2.3, 0] : ANCHOR));
  const [tmp] = useState(() => ({
    vec: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    anchor: new THREE.Vector3(...anchor),
    ang: new THREE.Vector3(),
    goal: new THREE.Vector3(),
  }));
  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = 'chordal'; // 'centripetal' da NaN con puntos coincidentes en los primeros cuadros
    return c;
  });
  const [steel] = useState(() => new THREE.MeshStandardMaterial({ color: '#9a9a95', metalness: 1, roughness: 0.34 }));
  const [kin, setKin] = useState(false); // cuerpos cinemáticos mientras se arrastra o vuelve
  const [hovered, hover] = useState(false);

  const setMode = (m) => {
    mode.current = m;
    setKin(m !== 'free');
  };

  // Texturas: el atlas viene con UV de glTF (v desde arriba) → flipY desactivado.
  useEffect(() => {
    atlas.flipY = false;
    atlas.colorSpace = THREE.SRGBColorSpace;
    atlas.anisotropy = gl.capabilities.getMaxAnisotropy();
    atlas.needsUpdate = true;
    strap.wrapS = strap.wrapT = THREE.RepeatWrapping;
    strap.colorSpace = THREE.SRGBColorSpace;
    strap.anisotropy = 8;
    strap.needsUpdate = true;
  }, [atlas, strap, gl]);

  // Encuadre responsive: en contenedores estrechos se aleja la cámara para que el carné quepa siempre.
  useEffect(() => {
    const aspect = width / Math.max(1, height);
    camera.position.z = 10 * Math.max(1, 0.78 / aspect);
    camera.updateProjectionMatrix();
  }, [width, height, camera]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Entrada: al abrirse la cortina el carné cae girando desde arriba.
  useEffect(() => {
    if (!booted || intro.current) return;
    intro.current = true;
    last.current.flip = performance.now();
    if (reduced) return;
    spin.current.x = Math.PI * 5;
    spin.current.target = 0;
    card.current?.applyImpulse({ x: full ? -1.3 : -1.2, y: 0.4, z: 0.5 }, true);
  }, [booted, reduced, full]);

  // Voltear: cada pulso del botón o del clic suma media vuelta (el resorte la hace con rebote).
  useEffect(() => {
    if (!flipTick) return;
    spin.current.target += Math.PI;
    last.current.flip = performance.now();
  }, [flipTick]);

  useEffect(() => {
    nudgeRef.current = () => {
      card.current?.applyImpulse({ x: 0.12, y: 0.02, z: 0.05 }, true);
      card.current?.applyTorqueImpulse({ x: 0, y: 0.04, z: -0.03 }, true);
    };
    return () => {
      nudgeRef.current = null;
    };
  }, [nudgeRef]);

  useEffect(() => {
    window.addEventListener('pointerup', endDragRef);
    window.addEventListener('pointercancel', endDragRef);
    return () => {
      window.removeEventListener('pointerup', endDragRef);
      window.removeEventListener('pointercancel', endDragRef);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hovered && !kin) return undefined;
    document.body.style.cursor = mode.current === 'drag' ? 'grabbing' : 'grab';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, kin]);

  const seg = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const segType = kin ? 'kinematicPosition' : 'dynamic';

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  // Coloca los tres nodos de la cinta sobre la recta ancla→carné (con algo de comba si sobra cinta).
  const layChain = (p) => {
    const jx = p.x;
    const jy = p.y + 1.45;
    const dx = jx - tmp.anchor.x;
    const dy = jy - tmp.anchor.y;
    const slack = Math.max(0, MAX_REACH - Math.hypot(dx, dy));
    [j1, j2, j3].forEach((r, i) => {
      const t = (i + 1) / 4;
      r.current?.setNextKinematicTranslation({ x: tmp.anchor.x + dx * t, y: tmp.anchor.y + dy * t - Math.sin(Math.PI * t) * slack * 0.45, z: 0 });
    });
  };

  const endDrag = () => {
    document.documentElement.classList.remove('fp-dragging');
    if (mode.current !== 'drag') return;
    const v = vel.current;
    const off = pos.current.clone().sub(tmp.anchor);
    // Un lanzamiento horizontal con fuerza deja al carné dando vueltas.
    if (Math.abs(v.x) > 6) spin.current.target += Math.PI * Math.sign(v.x) * Math.max(1, Math.round(Math.abs(v.x) / 11));
    if (off.length() > MAX_REACH) {
      setMode('return'); // se pasó del largo de la cinta: vuelve como una liga
    } else {
      setMode('free');
      requestAnimationFrame(() => {
        [j1, j2, j3].forEach((r) => r.current?.setLinvel({ x: 0, y: 0, z: 0 }, true));
        card.current?.setLinvel({ x: clamp(v.x, -16, 16), y: clamp(v.y, -16, 16), z: 0 }, true);
      });
    }
  };

  const endDragLatest = useRef(endDrag);
  endDragLatest.current = endDrag;
  const endDragRef = useRef((e) => endDragLatest.current(e)).current;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // Giro del carné: resorte subamortiguado (rebote), con ligera inercia al arrastrar rápido.
    const s = spin.current;
    s.v += (70 * (s.target - s.x) - 9.5 * s.v) * dt;
    s.x += s.v * dt;
    if (face.current) face.current.rotation.y = s.x;
    // Voltea solo cada cierto tiempo si nadie lo toca.
    const now = performance.now();
    if (!reduced && visible && booted && mode.current === 'free' && !hovered && now - last.current.flip > 9000 && Math.abs(s.target - s.x) < 0.05) {
      s.target += Math.PI;
      last.current.flip = now;
    }
    if (onSide) {
      const back = Math.abs(Math.round(s.target / Math.PI)) % 2 === 1;
      if (back !== last.current.back) {
        last.current.back = back;
        onSide(back);
      }
    }
    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current) return;
    const t = state.clock.elapsedTime;

    if (mode.current === 'drag') {
      // El carné sigue al puntero por toda la pantalla; la cinta se estira entre el ancla y él.
      tmp.vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      tmp.dir.copy(tmp.vec).sub(state.camera.position).normalize();
      tmp.vec.add(tmp.dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
      const halfH = viewport.height / 2;
      const halfW = viewport.width / 2;
      const nx = clamp(tmp.vec.x - (dragged.current?.x || 0), -Math.max(0.3, halfW - 0.95), Math.max(0.3, halfW - 0.95));
      const ny = clamp(tmp.vec.y - (dragged.current?.y || 0), -halfH + 1.6, full ? halfH : anchor[1]);
      const prevX = pos.current.x;
      const prevY = pos.current.y;
      pos.current.set(nx, ny, 0);
      vel.current.x += ((nx - prevX) / Math.max(dt, 0.001) - vel.current.x) * 0.35;
      vel.current.y += ((ny - prevY) / Math.max(dt, 0.001) - vel.current.y) * 0.35;
      s.v += clamp(vel.current.x, -40, 40) * dt * 2.2; // el carné "se tuerce" al moverlo rápido
      card.current.setNextKinematicTranslation({ x: nx, y: ny, z: 0 });
      layChain(pos.current);
    } else if (mode.current === 'return') {
      tmp.goal.copy(pos.current).sub(tmp.anchor).setLength(MAX_REACH * 0.94).add(tmp.anchor);
      const k = Math.min(1, dt * 7);
      const before = pos.current.clone();
      pos.current.lerp(tmp.goal, k);
      card.current.setNextKinematicTranslation({ x: pos.current.x, y: pos.current.y, z: 0 });
      layChain(pos.current);
      if (pos.current.distanceTo(tmp.goal) < 0.1) {
        const v = pos.current.clone().sub(before).divideScalar(Math.max(dt, 0.001));
        setMode('free');
        requestAnimationFrame(() => {
          [j1, j2, j3].forEach((r) => r.current?.setLinvel({ x: 0, y: 0, z: 0 }, true));
          card.current?.setLinvel({ x: clamp(v.x, -10, 10), y: clamp(v.y, -10, 10), z: 0 }, true);
        });
      }
    } else if (!reduced) {
      pos.current.copy(card.current.translation());
      // Scroll → balanceo: la energía crece con la velocidad, empujando cerca de la frecuencia natural del péndulo.
      smooth.current += (clamp(scrollState.velocity, -90, 90) - smooth.current) * Math.min(1, delta * 9);
      const f = smooth.current;
      if (Math.abs(f) > 0.35) {
        const phase = Math.sin(t * 3.1);
        card.current.applyImpulse({ x: phase * Math.abs(f) * SCROLL_KICK, y: 0, z: f * SCROLL_KICK * 0.4 }, true);
        card.current.applyTorqueImpulse({ x: 0, y: phase * f * SCROLL_KICK * 0.05, z: -phase * Math.abs(f) * SCROLL_KICK * 0.03 }, true);
      }
    }

    // Cinta: los dos nodos intermedios se suavizan para que la curva no tiemble.
    [j1, j2].forEach((r) => {
      if (!r.current.lerped) r.current.lerped = new THREE.Vector3().copy(r.current.translation());
      const d = Math.max(0.1, Math.min(1, r.current.lerped.distanceTo(r.current.translation())));
      r.current.lerped.lerp(r.current.translation(), Math.min(1, delta * (10 + d * 40))); // acotado: con factor > 1 la interpolación diverge en cuadros lentos
    });
    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2.current.lerped);
    curve.points[2].copy(j1.current.lerped);
    curve.points[3].copy(fixed.current.translation());
    if (curve.points[0].distanceTo(curve.points[3]) > 0.05) band.current?.geometry.setPoints(curve.getPoints(32));

    if (mode.current === 'free') {
      // Estabiliza el giro físico en Y (el giro visible lo lleva el resorte); deriva mínima en reposo.
      tmp.ang.copy(card.current.angvel());
      const rot = card.current.rotation();
      const idle = !reduced && visible ? Math.sin(t * 1.15) * 0.1 : 0;
      card.current.setAngvel({ x: tmp.ang.x, y: tmp.ang.y - rot.y * 0.25 + idle, z: tmp.ang.z + (idle ? Math.sin(t * 0.9) * 0.04 : 0) });
    }
  });

  return (
    <>
      <group position={anchor}>
        <RigidBody ref={fixed} {...seg} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...seg} type={segType}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...seg} type={segType}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...seg} type={segType}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...seg} type={segType}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture?.(e.pointerId);
              const p = press.current;
              press.current = null;
              endDrag();
              // Un toque corto (sin arrastrar) voltea el carné.
              if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6 && performance.now() - p.t < 400) onFlip?.();
            }}
            onPointerDown={(e) => {
              document.documentElement.classList.add('fp-dragging');
              try { window.getSelection()?.removeAllRanges(); } catch { /* noop */ }
              press.current = { x: e.clientX, y: e.clientY, t: performance.now() };
              e.target.setPointerCapture?.(e.pointerId);
              onGrab?.();
              tmp.vec.copy(e.point);
              const cur = card.current.translation();
              dragged.current = { x: tmp.vec.x - cur.x, y: tmp.vec.y - cur.y };
              pos.current.set(cur.x, cur.y, 0);
              vel.current.set(0, 0, 0);
              setMode('drag');
            }}
          >
            <mesh ref={face} geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={atlas} side={THREE.DoubleSide} roughness={0.5} metalness={0.05} clearcoat={0.5} clearcoatRoughness={0.25} envMapIntensity={0.4} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={steel} />
            <mesh geometry={nodes.clamp.geometry} material={steel} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band} frustumCulled={false}>
        <meshLineGeometry />
        <meshLineMaterial transparent opacity={1} color="white" depthTest={false} resolution={[width, height]} useMap map={strap} repeat={[-1.6, 1]} lineWidth={0.7} />
      </mesh>
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={Math.PI * 0.3} />
      <Environment blur={0.75}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </>
  );
}

export default function Lanyard({ className = '', full = false }) {
  const wrap = useRef(null);
  const nudge = useRef(null);
  const [webgl] = useState(hasWebGL);
  const [inView, setInView] = useState(true);
  const [tabOn, setTabOn] = useState(true);
  const [ready, setReady] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [flipTick, setFlipTick] = useState(0);
  const [back, setBack] = useState(false);
  const [src, setSrc] = useState(null);
  const [bucket, setBucket] = useState('');
  const booted = useBooted();
  const [reduced] = useState(() => media('(prefers-reduced-motion: reduce)'));
  const [coarse] = useState(() => media('(pointer: coarse)'));
  const visible = inView && tabOn;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    // En modo pantalla completa los eventos se escuchan en la sección entera (el lienzo no bloquea botones ni texto).
    if (full) setSrc(el.closest('section') || el.parentElement);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(([e]) => setBucket(`${Math.round(e.contentRect.width / 160)}x${Math.round(e.contentRect.height / 160)}`)) : null;
    ro?.observe(el);
    if (typeof IntersectionObserver === 'undefined') return () => ro?.disconnect();
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => {
      io.disconnect();
      ro?.disconnect();
    };
  }, [full]);

  useEffect(() => {
    const on = () => setTabOn(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  const doFlip = () => {
    setGrabbed(true);
    setFlipTick((n) => n + 1);
  };
  const onReady = () => {
    setReady(true);
    markCardReady();
  };
  const canvasOk = webgl && (!full || src);

  return (
    <div ref={wrap} className={`absolute inset-0 ${className}`}>
      <div className="absolute inset-0" role="img" aria-label="Carné de identificación de Frank Pineda colgado de una cinta. Se puede arrastrar por la pantalla, lanzar y voltear.">
        {(!webgl || !ready) && !full && <LanyardFallback />}
        {canvasOk && (
          <Canvas
            className={ready && booted ? 'opacity-100' : 'opacity-0'}
            style={{ touchAction: full ? 'auto' : 'pan-y', transition: 'opacity .5s', pointerEvents: full ? 'none' : 'auto' }}
            eventSource={full ? src : undefined}
            eventPrefix={full ? 'client' : undefined}
            frameloop={visible ? 'always' : 'never'}
            dpr={[1, coarse ? 1.5 : 1.75]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 10], fov: 25 }}
            onCreated={(state) => {
              const el = state.gl.domElement;
              el.addEventListener('webglcontextlost', (e) => e.preventDefault());
              // El puntero se mide contra el lienzo, no contra el elemento que recibió el evento (texto, botones…).
              if (full) {
                state.setEvents({
                  compute: (ev, st) => {
                    const r = el.getBoundingClientRect();
                    st.pointer.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
                    st.raycaster.setFromCamera(st.pointer, st.camera);
                  },
                });
              }
            }}
          >
            <Lights />
            <Physics key={bucket} gravity={[0, -40, 0]} timeStep={1 / 60} interpolate paused={!visible}>
              <Band
                visible={visible}
                reduced={reduced}
                full={full}
                booted={booted}
                nudgeRef={nudge}
                flipTick={flipTick}
                onSide={setBack}
                onFlip={doFlip}
                onGrab={() => setGrabbed(true)}
                onReady={onReady}
              />
            </Physics>
          </Canvas>
        )}
      </div>
      {webgl && ready && booted && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-3 px-4">
            <p aria-hidden className={`m-0 text-[0.84rem] text-fg-3 transition-opacity duration-500 ${grabbed ? 'opacity-0' : 'opacity-100'}`}>
              {coarse ? 'Desliza el carné' : full ? 'Arrástralo por toda la pantalla' : 'Arrastra el carné'}
            </p>
            <button
              type="button"
              onClick={doFlip}
              aria-pressed={back}
              className="btn btn-sm pointer-events-auto"
              style={{ background: 'rgba(12,13,14,.55)', backdropFilter: 'blur(6px)' }}
            >
              <RotateCw size={14} aria-hidden /> {back ? 'Ver frente' : 'Ver reverso'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setGrabbed(true);
              nudge.current?.();
            }}
            className="sr-only focus:not-sr-only focus:absolute focus:bottom-4 focus:left-1/2 focus:z-10 focus:-translate-x-1/2 focus:rounded-full focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
          >
            Mover el carné
          </button>
        </>
      )}
    </div>
  );
}
