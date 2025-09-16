import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stars, 
  Text, 
  Sphere, 
  Box,
  useTexture,
  Trail,
  Point,
  PointMaterial,
  Line
} from '@react-three/drei';
import { 
  Rocket, 
  Globe, 
  Settings, 
  BarChart3, 
  Info, 
  Play, 
  Pause,
  RotateCcw,
  Zap,
  Sun,
  Wind
} from 'lucide-react';
import { missionAPI, MissionParameters } from './services/api';
import * as THREE from 'three';

// Local types for UI state
interface UIMissionParameters {
  launchDate: string;
  propulsionType: 'chemical' | 'ion' | 'solar-sail';
  payloadSize: 'small' | 'medium' | 'large';
}

interface UIMissionResults {
  travelTime: number; // years
  deltaV: number; // km/s
  successProbability: number; // 0-1
  missionLog: string[];
  fuelCost: number;
  missionStatus: string;
}

// Realistic Earth Component
const RealisticEarth: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.01;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={position}>
      {/* Earth with realistic materials */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhongMaterial 
          color="#4A90E2" 
          shininess={100}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Atmospheric glow */}
      <mesh>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.22, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Aurora effect */}
      <mesh>
        <sphereGeometry args={[1.26, 16, 16]} />
        <meshBasicMaterial 
          color="#00ff88" 
          transparent 
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
      
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Earth
      </Text>
    </group>
  );
};

// Realistic 3I/ATLAS Comet Component
const RealisticAtlas: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const cometRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (cometRef.current) {
      cometRef.current.rotation.y += 0.02;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y += 0.01;
    }
  });

  // Comet tail particles
  const tailPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.5 + 0.1;
      const height = Math.random() * 2 - 1;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        )
      );
    }
    return points;
  }, []);

  return (
    <group position={position}>
      {/* Comet nucleus */}
      <mesh ref={cometRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshPhongMaterial 
          color="#FFD700" 
          shininess={50}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Coma (gas cloud around nucleus) */}
      <mesh>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial 
          color="#00ff88" 
          transparent 
          opacity={0.2}
        />
      </mesh>
      
      {/* Comet tail */}
      <points ref={tailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(tailPoints.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#00ffff" 
          size={0.02}
          transparent
          opacity={0.6}
        />
      </points>
      
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        3I/ATLAS
      </Text>
    </group>
  );
};

// Advanced Spacecraft Component
const AdvancedSpacecraft: React.FC<{ 
  position: [number, number, number]; 
  propulsionType: string;
  isAnimating: boolean;
}> = ({ position, propulsionType, isAnimating }) => {
  const spacecraftRef = useRef<THREE.Group>(null);
  const engineRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (spacecraftRef.current && isAnimating) {
      spacecraftRef.current.rotation.y += 0.05;
    }
    if (engineRef.current && isAnimating) {
      engineRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
    }
  });

  const getSpacecraftDesign = () => {
    switch (propulsionType) {
      case 'chemical':
        return (
          <group>
            {/* Main body */}
            <mesh>
              <cylinderGeometry args={[0.1, 0.15, 0.4, 8]} />
              <meshPhongMaterial color="#C0C0C0" shininess={100} />
            </mesh>
            {/* Fuel tanks */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
              <meshPhongMaterial color="#FF6B6B" />
            </mesh>
            {/* Engine */}
            <mesh ref={engineRef} position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.05, 0.08, 0.2, 8]} />
              <meshPhongMaterial color="#FF4500" />
            </mesh>
            {/* Engine flame */}
            {isAnimating && (
              <mesh position={[0, -0.5, 0]}>
                <coneGeometry args={[0.1, 0.3, 8]} />
                <meshBasicMaterial color="#FF0000" transparent opacity={0.7} />
              </mesh>
            )}
          </group>
        );
      
      case 'ion':
        return (
          <group>
            {/* Main body */}
            <mesh>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshPhongMaterial color="#C0C0C0" shininess={100} />
            </mesh>
            {/* Solar panels */}
            <mesh position={[0.3, 0, 0]}>
              <boxGeometry args={[0.4, 0.05, 0.2]} />
              <meshPhongMaterial color="#0000FF" />
            </mesh>
            <mesh position={[-0.3, 0, 0]}>
              <boxGeometry args={[0.4, 0.05, 0.2]} />
              <meshPhongMaterial color="#0000FF" />
            </mesh>
            {/* Ion thrusters */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshPhongMaterial color="#00FFFF" />
            </mesh>
            {/* Ion beam */}
            {isAnimating && (
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
                <meshBasicMaterial color="#00FFFF" transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        );
      
      case 'solar-sail':
        return (
          <group>
            {/* Main body */}
            <mesh>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshPhongMaterial color="#C0C0C0" shininess={100} />
            </mesh>
            {/* Solar sail */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshBasicMaterial 
                color="#FFFF00" 
                transparent 
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Sail supports */}
            <mesh position={[0.2, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.4, 8]} />
              <meshPhongMaterial color="#C0C0C0" />
            </mesh>
            <mesh position={[-0.2, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.4, 8]} />
              <meshPhongMaterial color="#C0C0C0" />
            </mesh>
          </group>
        );
      
      default:
        return (
          <mesh>
            <boxGeometry args={[0.3, 0.15, 0.15]} />
            <meshPhongMaterial color="#FF6B6B" />
          </mesh>
        );
    }
  };

  return (
    <group ref={spacecraftRef} position={position}>
      {getSpacecraftDesign()}
    </group>
  );
};

// Solar System Planets Component
const SolarSystemPlanets: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const mercuryRef = useRef<THREE.Mesh>(null);
  const venusRef = useRef<THREE.Mesh>(null);
  const marsRef = useRef<THREE.Mesh>(null);
  const jupiterRef = useRef<THREE.Mesh>(null);
  const saturnRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.01;
    }
    if (mercuryRef.current) {
      mercuryRef.current.rotation.y += 0.02;
    }
    if (venusRef.current) {
      venusRef.current.rotation.y += 0.015;
    }
    if (marsRef.current) {
      marsRef.current.rotation.y += 0.018;
    }
    if (jupiterRef.current) {
      jupiterRef.current.rotation.y += 0.012;
    }
    if (saturnRef.current) {
      saturnRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group>
      {/* Sun */}
      <mesh ref={sunRef} position={[-8, 0, 0]}>
        <sphereGeometry args={[3.0, 32, 32]} />
        <meshBasicMaterial color="#FFD700" />
        <Text
          position={[0, 4.2, 0]}
          fontSize={0.6}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Sun
        </Text>
      </mesh>

      {/* Mercury */}
      <mesh ref={mercuryRef} position={[-6, 0.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhongMaterial color="#8C7853" />
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Mercury
        </Text>
      </mesh>

      {/* Venus */}
      <mesh ref={venusRef} position={[-4, -0.3, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshPhongMaterial color="#FFC649" />
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Venus
        </Text>
      </mesh>

      {/* Mars */}
      <mesh ref={marsRef} position={[2, 0.8, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshPhongMaterial color="#CD5C5C" />
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Mars
        </Text>
      </mesh>

      {/* Jupiter */}
      <mesh ref={jupiterRef} position={[7.5, -0.5, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshPhongMaterial color="#D8CA9D" />
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Jupiter
        </Text>
      </mesh>

      {/* Saturn with rings */}
      <group ref={saturnRef} position={[10.5, 0.2, 0]}>
        <mesh>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshPhongMaterial color="#FAD5A5" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.4, 0.09, 12, 48]} />
          <meshBasicMaterial color="#C0C0C0" transparent opacity={0.6} />
        </mesh>
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Saturn
        </Text>
      </group>
    </group>
  );
};

// Enhanced Space Environment
const SpaceEnvironment: React.FC = () => {
  return (
    <group>
      {/* Enhanced star field */}
      <Stars 
        radius={300} 
        depth={200} 
        count={15000} 
        factor={10} 
        saturation={0.3} 
        fade 
        speed={0.3} 
      />
      
      {/* Nebula background */}
      <mesh position={[0, 0, -80]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial 
          color="#4B0082" 
          transparent 
          opacity={0.08}
        />
      </mesh>
      
      {/* Solar wind particles */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial 
          color="#00FFFF" 
          transparent 
          opacity={0.03}
        />
      </mesh>

      {/* Solar System Planets */}
      <SolarSystemPlanets />
    </group>
  );
};

// 3D Scene Component
const SpaceScene: React.FC<{ 
  missionResults: UIMissionResults; 
  isAnimating: boolean;
  propulsionType: string;
  launchDate: string;
}> = ({ 
  missionResults, 
  isAnimating,
  propulsionType,
  launchDate
}) => {
  // Calculate time-based positions for Earth and 3I/ATLAS based on real orbital data
  const getTimeBasedPositions = () => {
    const launch = new Date(launchDate);
    const optimalDate = new Date('2025-10-30'); // Real perihelion date
    const daysDiff = (launch.getTime() - optimalDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Earth orbital motion (simplified)
    const earthOrbitalPhase = (daysDiff / 365.25) * 2 * Math.PI;
    const earthPosition: [number, number, number] = [
      -3 + 0.3 * Math.cos(earthOrbitalPhase), 
      0.3 * Math.sin(earthOrbitalPhase), 
      0
    ];
    
    // 3I/ATLAS hyperbolic trajectory (real data)
    // Perihelion: 1.4 AU, closest to Earth: 1.8 AU in Dec 2025
    // Velocity: ~60 km/s, hyperbolic escape trajectory
    
    // Distance from Sun (simplified hyperbolic trajectory)
    const timeFromPerihelion = daysDiff / 365.25; // years
    const perihelionDistance = 1.4; // AU
    const currentDistance = perihelionDistance + Math.abs(timeFromPerihelion) * 2.0; // AU
    
    // Convert AU to our scale (1 AU = 2 units in our visualization)
    const scaledDistance = currentDistance * 2;
    
    // 3I/ATLAS position (moving away from Sun)
    const atlasPosition: [number, number, number] = [
      scaledDistance, 
      3 + timeFromPerihelion * 0.5, 
      0
    ];
    
    return { earthPosition, atlasPosition, currentDistance, timeFromPerihelion };
  };

  const { earthPosition, atlasPosition } = getTimeBasedPositions();

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#87CEEB" />
      <directionalLight position={[0, 0, 5]} intensity={0.6} color="#FFD700" />
      {/* Sun light */}
      <pointLight position={[-8, 0, 0]} intensity={2.0} color="#FFD700" />
      
      {/* Space environment */}
      <SpaceEnvironment />
      
      {/* Realistic Earth */}
      <RealisticEarth position={earthPosition} />

      {/* Realistic 3I/ATLAS */}
      <RealisticAtlas position={atlasPosition} />

      {/* Advanced Spacecraft */}
      <AdvancedSpacecraft 
        position={earthPosition} 
        propulsionType={propulsionType}
        isAnimating={isAnimating}
      />

      {/* Dynamic Trajectory Line */}
      <TrajectoryLine 
        isAnimating={isAnimating} 
        travelTime={missionResults.travelTime}
        propulsionType={propulsionType}
        earthPosition={earthPosition}
        atlasPosition={atlasPosition}
      />

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};

// Enhanced Trajectory Line Component
const TrajectoryLine: React.FC<{ 
  isAnimating: boolean; 
  travelTime: number;
  propulsionType: string;
  earthPosition: [number, number, number];
  atlasPosition: [number, number, number];
}> = ({ isAnimating, travelTime, propulsionType, earthPosition, atlasPosition }) => {
  const trailRef = useRef<THREE.Points>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  useFrame((state) => {
    if (isAnimating && trailRef.current) {
      setAnimationProgress((state.clock.elapsedTime % 10) / 10);
    }
  });
  
  // Generate smooth trajectory points using Bezier curves
  const getTrajectoryPoints = () => {
    const [earthX, earthY, earthZ] = earthPosition;
    const [atlasX, atlasY, atlasZ] = atlasPosition;
    
    const points = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let x, y, z;
    
    switch (propulsionType) {
      case 'chemical':
          // Direct trajectory with slight curve
          x = earthX + (atlasX - earthX) * t;
          y = earthY + (atlasY - earthY) * t + Math.sin(t * Math.PI) * 0.5;
          z = earthZ + (atlasZ - earthZ) * t;
          break;
        
      case 'ion':
          // Efficient curved trajectory
          const controlX = (earthX + atlasX) / 2;
          const controlY = Math.max(earthY, atlasY) + 1.5;
          x = Math.pow(1-t, 2) * earthX + 2 * (1-t) * t * controlX + Math.pow(t, 2) * atlasX;
          y = Math.pow(1-t, 2) * earthY + 2 * (1-t) * t * controlY + Math.pow(t, 2) * atlasY;
          z = earthZ + (atlasZ - earthZ) * t;
          break;
        
      case 'solar-sail':
          // Large gravity assist trajectory
          const sailControl1X = earthX + (atlasX - earthX) * 0.3;
          const sailControl1Y = earthY + 3.0;
          const sailControl2X = earthX + (atlasX - earthX) * 0.7;
          const sailControl2Y = earthY + 2.0;
          
          x = Math.pow(1-t, 3) * earthX + 
              3 * Math.pow(1-t, 2) * t * sailControl1X + 
              3 * (1-t) * Math.pow(t, 2) * sailControl2X + 
              Math.pow(t, 3) * atlasX;
          y = Math.pow(1-t, 3) * earthY + 
              3 * Math.pow(1-t, 2) * t * sailControl1Y + 
              3 * (1-t) * Math.pow(t, 2) * sailControl2Y + 
              Math.pow(t, 3) * atlasY;
          z = earthZ + (atlasZ - earthZ) * t;
          break;
        
      default:
          x = earthX + (atlasX - earthX) * t;
          y = earthY + (atlasY - earthY) * t;
          z = earthZ + (atlasZ - earthZ) * t;
    }
      
      points.push([x, y, z]);
    }
    
    return points;
  };

  const points = getTrajectoryPoints();
  const trajectoryPositions = useMemo(() => {
    return new Float32Array(points.flat());
  }, [points]);

  // Different colors and effects for different propulsion types
  const getTrajectoryColor = () => {
    switch (propulsionType) {
      case 'chemical': return '#ff4444'; // Red - direct, fast
      case 'ion': return '#44ff44'; // Green - efficient
      case 'solar-sail': return '#4444ff'; // Blue - slow but sustainable
      default: return '#00ff88';
    }
  };

  const getTrailColor = () => {
    switch (propulsionType) {
      case 'chemical': return '#ff6666'; // Brighter red
      case 'ion': return '#66ff66'; // Brighter green
      case 'solar-sail': return '#6666ff'; // Brighter blue
      default: return '#00ffaa';
    }
  };

  return (
    <group>
      {/* Main trajectory line */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[trajectoryPositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={getTrajectoryColor()} 
          linewidth={3}
          transparent
          opacity={0.8}
        />
      </line>

      {/* Animated trail effect */}
      {isAnimating && (
        <points ref={trailRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  points.slice(0, Math.floor(points.length * animationProgress)).flat()
                ), 
                3
              ]}
            />
          </bufferGeometry>
          <pointsMaterial 
            color={getTrailColor()} 
            size={0.05}
            transparent
            opacity={0.8}
          />
        </points>
      )}

      {/* Trajectory waypoints with pulsing effect */}
      {points.filter((_, index) => index % 10 === 0).map((point, index) => (
        <mesh key={index} position={point as [number, number, number]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial 
            color={isAnimating ? getTrailColor() : "#00ff88"} 
            opacity={0.7} 
            transparent 
          />
        </mesh>
      ))}

      {/* Animated spacecraft along trajectory */}
      {isAnimating && (
        <mesh position={points[Math.floor(points.length * animationProgress)] as [number, number, number]}>
          <boxGeometry args={[0.2, 0.1, 0.1]} />
          <meshPhongMaterial color="#FF6B6B" shininess={100} />
        </mesh>
      )}

      {/* Propulsion-specific effects */}
      {isAnimating && (
        <group>
          {propulsionType === 'chemical' && (
            <mesh position={points[Math.floor(points.length * animationProgress)] as [number, number, number]}>
              <coneGeometry args={[0.05, 0.2, 8]} />
              <meshBasicMaterial color="#FF0000" transparent opacity={0.6} />
            </mesh>
          )}
          
          {propulsionType === 'ion' && (
            <mesh position={points[Math.floor(points.length * animationProgress)] as [number, number, number]}>
              <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
              <meshBasicMaterial color="#00FFFF" transparent opacity={0.8} />
            </mesh>
          )}
          
          {propulsionType === 'solar-sail' && (
            <mesh position={points[Math.floor(points.length * animationProgress)] as [number, number, number]}>
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial color="#FFFF00" transparent opacity={0.5} />
            </mesh>
          )}
        </group>
      )}

      {/* Mission timeline markers */}
      {points.filter((_, index) => index % 25 === 0).map((point, index) => {
        const timeMarker = (index / 25) * travelTime;
        return (
          <group key={`marker-${index}`} position={point as [number, number, number]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <Text
              position={[0, 0.2, 0]}
              fontSize={0.1}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {timeMarker.toFixed(1)}y
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Enhanced Control Panel Component with Glassmorphism
const ControlPanel: React.FC<{
  parameters: UIMissionParameters;
  onParametersChange: (params: UIMissionParameters) => void;
  onSimulate: () => void;
  onReset: () => void;
  isSimulating: boolean;
}> = ({ parameters, onParametersChange, onSimulate, onReset, isSimulating }) => {
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6 border border-white/20 shadow-2xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
        <Settings className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Mission Controls</h2>
      </div>

      {/* Mission Feasibility Warning */}
      <div className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl backdrop-blur-sm">
        <div className="text-yellow-100 text-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <strong className="text-yellow-200">Real Mission Constraints</strong>
          </div>
          <div className="space-y-1 text-xs">
            <div>• Optimal launch: <strong>October 30, 2025</strong> (passed!)</div>
            <div>• 3I/ATLAS velocity: <strong>60 km/s</strong></div>
            <div>• Mission impossible after <strong>2026</strong></div>
          </div>
        </div>
      </div>

      {/* Launch Date */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-200">Launch Window</label>
        <input
          type="datetime-local"
          value={parameters.launchDate}
          onChange={(e) => onParametersChange({ ...parameters, launchDate: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
        />
      </div>

      {/* Propulsion System */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-200">Propulsion System</label>
      <div className="space-y-2">
          {[
            { value: 'chemical', label: 'Chemical', icon: '🚀', desc: 'High Thrust' },
            { value: 'ion', label: 'Ion', icon: '⚡', desc: 'High Efficiency' },
            { value: 'solar-sail', label: 'Solar Sail', icon: '⛵', desc: 'No Fuel' }
          ].map((prop) => (
            <button
              key={prop.value}
              onClick={() => onParametersChange({ 
            ...parameters, 
                propulsionType: prop.value as UIMissionParameters['propulsionType'] 
              })}
              className={`w-full p-3 rounded-xl transition-all duration-200 ${
                parameters.propulsionType === prop.value
                  ? 'bg-blue-500/30 border-2 border-blue-400 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{prop.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{prop.label}</div>
                  <div className="text-xs opacity-75">{prop.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payload Size */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-200">Payload Size</label>
        <div className="grid grid-cols-3 gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => onParametersChange({ ...parameters, payloadSize: size })}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                parameters.payloadSize === size
                  ? 'bg-green-500/30 border-2 border-green-400 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span className="font-semibold">{isSimulating ? 'Simulating...' : 'Simulate Mission'}</span>
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Enhanced Metrics Panel Component
const MetricsPanel: React.FC<{ results: UIMissionResults }> = ({ results }) => {
  const getSuccessColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-400';
    if (probability >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSuccessGradient = (probability: number) => {
    if (probability >= 0.8) return 'from-green-500 to-emerald-500';
    if (probability >= 0.6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6 border border-white/20 shadow-2xl"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
        <BarChart3 className="w-6 h-6 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Mission Metrics</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Travel Time */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-gray-200">Travel Time</span>
            </div>
            <span className="text-2xl font-bold text-blue-400">{results.travelTime.toFixed(1)} years</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((results.travelTime / 10) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Delta V */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-gray-200">ΔV Required</span>
            </div>
            <span className="text-2xl font-bold text-orange-400">{results.deltaV.toFixed(1)} km/s</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((results.deltaV / 20) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.7 }}
            />
          </div>
        </div>

        {/* Success Probability */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-gray-200">Success Probability</span>
            </div>
            <span className={`text-2xl font-bold ${getSuccessColor(results.successProbability)}`}>
              {(results.successProbability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div 
              className={`h-3 rounded-full bg-gradient-to-r ${getSuccessGradient(results.successProbability)}`}
              initial={{ width: 0 }}
              animate={{ width: `${results.successProbability * 100}%` }}
              transition={{ duration: 1, delay: 0.9 }}
            />
          </div>
        </div>

        {/* Fuel Cost */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-gray-200">Fuel Cost</span>
            </div>
            <span className="text-2xl font-bold text-purple-400">{results.fuelCost.toFixed(1)} units</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((results.fuelCost / 50) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 1.1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Mission Log Component
const MissionLog: React.FC<{ logs: string[] }> = ({ logs }) => {
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
        <Rocket className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Mission Log</h3>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            className="text-sm text-gray-200 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <span className="text-blue-400 text-xs">[{new Date().toLocaleTimeString()}]</span>
                <div className="mt-1">{log}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Enhanced Educational Info Component
const EducationalInfo: React.FC = () => {
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
        <Info className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white">About 3I/ATLAS</h3>
      </div>
      <div className="space-y-4 text-sm text-gray-200">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <strong className="text-cyan-300">Interstellar Visitor</strong>
          </div>
          <p className="text-gray-200">
            3I/ATLAS is an interstellar object that entered our solar system in 2019. 
          It's the first confirmed interstellar comet and represents a unique opportunity for scientific study.
        </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <strong className="text-green-300">Mission Significance</strong>
          </div>
          <p className="text-gray-200">
            Intercepting 3I/ATLAS would provide unprecedented data about interstellar objects 
            and the composition of matter from other star systems.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <strong className="text-orange-300">Technical Challenges</strong>
          </div>
          <p className="text-gray-200">
            The object is moving at high velocity (60 km/s) and has an unusual trajectory, 
            making interception timing and propulsion selection critical for mission success.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [parameters, setParameters] = useState<UIMissionParameters>({
    launchDate: '2025-10-30T10:00', // Real optimal launch date
    propulsionType: 'ion',
    payloadSize: 'medium'
  });

  const [results, setResults] = useState<UIMissionResults>({
    travelTime: 0,
    deltaV: 0,
    successProbability: 0,
    missionLog: [],
    fuelCost: 0,
    missionStatus: 'pending'
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Simulate mission using real API
  const simulateMission = async () => {
    setIsSimulating(true);
    setIsAnimating(false);
    setApiError(null);
    
    try {
      // Convert UI parameters to API format
      const apiParams: MissionParameters = {
        launch_date: parameters.launchDate,
        propulsion_type: parameters.propulsionType,
        payload_size: parameters.payloadSize
      };

      // Call the API
      const apiResults = await missionAPI.simulate(apiParams);
      
      // Convert API results to UI format
      const newResults: UIMissionResults = {
        travelTime: apiResults.travel_time,
        deltaV: apiResults.delta_v,
        successProbability: apiResults.success_probability,
        missionLog: apiResults.mission_log,
        fuelCost: apiResults.fuel_cost,
        missionStatus: apiResults.mission_status
      };

      setResults(newResults);
      setIsAnimating(true);
    } catch (error) {
      console.error('API Error:', error);
      setApiError('Failed to connect to simulation API. Using offline mode...');
      
      // Fallback to simplified calculation
      const baseDeltaV = 15;
      const baseTravelTime = 5;
      
      let deltaVMultiplier = 1;
      let timeMultiplier = 1;
      let successBase = 0.7;

      switch (parameters.propulsionType) {
        case 'chemical':
          deltaVMultiplier = 1.2;
          timeMultiplier = 0.8;
          successBase = 0.6;
          break;
        case 'ion':
          deltaVMultiplier = 0.8;
          timeMultiplier = 1.2;
          successBase = 0.8;
          break;
        case 'solar-sail':
          deltaVMultiplier = 0.3;
          timeMultiplier = 2.0;
          successBase = 0.5;
          break;
      }

      switch (parameters.payloadSize) {
        case 'small':
          deltaVMultiplier *= 0.9;
          timeMultiplier *= 0.9;
          successBase += 0.1;
          break;
        case 'large':
          deltaVMultiplier *= 1.3;
          timeMultiplier *= 1.3;
          successBase -= 0.1;
          break;
      }

      const finalDeltaV = baseDeltaV * deltaVMultiplier;
      const finalTravelTime = baseTravelTime * timeMultiplier;
      const finalSuccess = Math.max(0.1, Math.min(0.95, successBase));

      const newResults: UIMissionResults = {
        travelTime: finalTravelTime,
        deltaV: finalDeltaV,
        successProbability: finalSuccess,
        missionLog: [
          '⚠️ Offline mode - API unavailable',
          `Mission parameters: ${parameters.propulsionType} propulsion, ${parameters.payloadSize} payload`,
          `Calculated ΔV requirement: ${finalDeltaV.toFixed(1)} km/s`,
          `Estimated travel time: ${finalTravelTime.toFixed(1)} years`,
          `Mission success probability: ${(finalSuccess * 100).toFixed(0)}%`
        ],
        fuelCost: finalDeltaV * 0.8,
        missionStatus: finalSuccess > 0.7 ? 'success' : 'warning'
      };

      setResults(newResults);
      setIsAnimating(true);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetMission = () => {
    setResults({
      travelTime: 0,
      deltaV: 0,
      successProbability: 0,
      missionLog: [],
      fuelCost: 0,
      missionStatus: 'pending'
    });
    setIsAnimating(false);
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-green-500/8 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-orange-500/6 rounded-full blur-2xl animate-pulse delay-300"></div>
      </div>

      {/* Enhanced Header */}
      <motion.header 
        className="bg-white/5 backdrop-blur-md border-b border-white/10 shadow-2xl relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
                <Rocket className="w-10 h-10 text-blue-400" />
              </div>
            <div>
                <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Intercepting 3I/ATLAS
                </h1>
                <p className="text-gray-300 text-lg">Interactive Mission Planner & Visualization Dashboard</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Mission Status</div>
                <div className="text-lg font-semibold text-green-400">Operational</div>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Error Display */}
        {apiError && (
          <motion.div 
            className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4 backdrop-blur-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-200 text-sm font-medium">{apiError}</span>
            </div>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Controls and Info */}
          <div className="xl:col-span-3 space-y-6">
            <ControlPanel
              parameters={parameters}
              onParametersChange={setParameters}
              onSimulate={simulateMission}
              onReset={resetMission}
              isSimulating={isSimulating}
            />
            <EducationalInfo />
          </div>

          {/* Center Column - Enhanced 3D Visualization */}
          <div className="xl:col-span-6">
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 aspect-square border border-white/20 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Globe className="w-6 h-6 text-green-400" />
              </div>
                  <h3 className="text-xl font-bold text-white">Mission Visualization</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Live</span>
                </div>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                <SpaceScene 
                  missionResults={results} 
                  isAnimating={isAnimating}
                  propulsionType={parameters.propulsionType}
                  launchDate={parameters.launchDate}
                />
              </div>
              {/* Visualization Controls */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>🖱️ Drag to rotate</span>
                  <span>🔍 Scroll to zoom</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Propulsion:</span>
                  <span className="text-white font-medium">{parameters.propulsionType}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Metrics and Logs */}
          <div className="xl:col-span-3 space-y-6">
            <MetricsPanel results={results} />
            <MissionLog logs={results.missionLog} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;