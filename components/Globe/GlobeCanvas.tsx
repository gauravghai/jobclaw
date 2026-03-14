"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { JobPin, CountryJobCount } from "@/lib/types";
import { COUNTRY_NAMES } from "@/lib/constants";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface GeoFeature {
  properties: {
    ISO_A2: string;
    ADMIN: string;
    NAME: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface MatchLabel {
  lat: number;
  lng: number;
  text: string;
  score: number;
  title: string;
  company: string;
}

interface GlobeCanvasProps {
  pins: JobPin[];
  countryCounts: CountryJobCount[];
  onCountrySelect: (country: string, countryName: string) => void;
  onPinSelect: (pin: JobPin) => void;
  sidebarOpen: boolean;
  matchScores?: Record<string, number>;
}

function getMatchColor(score: number): string {
  if (score >= 70) return "#00E5A0";
  if (score >= 40) return "#FFB800";
  if (score > 0) return "#FF6B35";
  return "#444466";
}

export default function GlobeCanvas({
  pins,
  countryCounts,
  onCountrySelect,
  onPinSelect,
  sidebarOpen,
  matchScores,
}: GlobeCanvasProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<{ features: GeoFeature[] }>({
    features: [],
  });
  const [hoverCountry, setHoverCountry] = useState<GeoFeature | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const aiMode = useMemo(
    () => matchScores && Object.keys(matchScores).length > 0,
    [matchScores]
  );

  const countryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    countryCounts.forEach((c) => map.set(c.country, c.count));
    return map;
  }, [countryCounts]);

  // Force globe to re-render polygons when filter-derived counts change
  const polygonsForGlobe = useMemo(() => {
    return countries.features.length > 0 ? [...countries.features] : [];
  }, [countries.features, countryCounts]);

  const maxCount = useMemo(
    () => Math.max(...countryCounts.map((c) => c.count), 1),
    [countryCounts]
  );

  // Generate match score labels for matched pins — show score + title as persistent hover cards
  const matchLabels = useMemo<MatchLabel[]>(() => {
    if (!aiMode || !matchScores) return [];
    return pins
      .filter((p) => (matchScores[p.job_id] || 0) > 0)
      .sort((a, b) => (matchScores[b.job_id] || 0) - (matchScores[a.job_id] || 0))
      .slice(0, 80)
      .map((p) => ({
        lat: p.job_latitude,
        lng: p.job_longitude,
        text: `${matchScores[p.job_id]}%`,
        score: matchScores[p.job_id],
        title: p.job_title,
        company: p.employer_name,
      }));
  }, [pins, matchScores, aiMode]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
    )
      .then((r) => r.json())
      .then(setCountries);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 640;
      const w = sidebarOpen && !isMobile ? window.innerWidth - 440 : window.innerWidth;
      setDimensions({ width: Math.max(w, 300), height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [sidebarOpen]);

  useEffect(() => {
    const initGlobe = () => {
      const globe = globeRef.current as {
        controls: () => { autoRotate: boolean; autoRotateSpeed: number };
        pointOfView: (
          coords: { lat: number; lng: number; altitude: number },
          ms?: number
        ) => void;
      } | null;
      if (globe?.controls) {
        const controls = globe.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;
        if (globe.pointOfView) {
          globe.pointOfView({ lat: 22, lng: 78, altitude: 2.5 }, 0);
        }
        return true;
      }
      return false;
    };

    if (!initGlobe()) {
      const interval = setInterval(() => {
        if (initGlobe()) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [countries]);

  const getIso = useCallback((feat: GeoFeature) => {
    const iso = feat.properties.ISO_A2;
    if (iso && iso !== "-99") return iso;
    const name = (
      feat.properties.ADMIN ||
      feat.properties.NAME ||
      ""
    ).toLowerCase();
    const nameToIso: Record<string, string> = {
      "united arab emirates": "AE",
      france: "FR",
      norway: "NO",
      "northern cyprus": "CY",
      somaliland: "SO",
      kosovo: "XK",
      "western sahara": "EH",
    };
    return nameToIso[name] || iso;
  }, []);

  const getCountryColor = useCallback(
    (feat: GeoFeature) => {
      const iso = getIso(feat);
      const count = countryCountMap.get(iso) || 0;
      if (count === 0) return "rgba(15, 18, 35, 0.5)";

      const intensity =
        0.4 + 0.6 * (Math.log(count + 1) / Math.log(maxCount + 1));

      const regionColors: Record<string, [number, number, number]> = {
        US: [0, 210, 230],
        CA: [0, 195, 215],
        MX: [0, 180, 200],
        BR: [230, 160, 30],
        AR: [220, 150, 25],
        CO: [210, 145, 20],
        CL: [200, 140, 25],
        PE: [215, 150, 30],
        GB: [90, 100, 240],
        DE: [110, 80, 220],
        FR: [130, 90, 230],
        NL: [80, 120, 250],
        SE: [100, 140, 255],
        IE: [70, 180, 200],
        CH: [120, 110, 235],
        ES: [150, 80, 210],
        IT: [140, 100, 225],
        PL: [95, 130, 245],
        NO: [85, 150, 255],
        DK: [105, 160, 250],
        FI: [75, 170, 240],
        AT: [125, 95, 220],
        BE: [115, 105, 235],
        CZ: [100, 125, 240],
        RO: [135, 85, 215],
        PT: [145, 95, 225],
        UA: [90, 140, 250],
        RU: [80, 110, 230],
        IN: [255, 190, 100],
        JP: [248, 185, 105],
        CN: [252, 188, 95],
        KR: [245, 182, 110],
        SG: [255, 195, 102],
        TW: [250, 186, 98],
        TH: [248, 180, 108],
        MY: [252, 192, 96],
        ID: [248, 184, 100],
        VN: [245, 178, 112],
        PH: [255, 190, 95],
        PK: [242, 175, 115],
        BD: [240, 172, 118],
        LK: [246, 180, 106],
        AE: [230, 70, 120],
        SA: [220, 60, 110],
        IL: [210, 80, 140],
        QA: [225, 65, 115],
        TR: [215, 75, 130],
        ZA: [230, 120, 50],
        NG: [220, 110, 40],
        KE: [210, 100, 35],
        EG: [225, 115, 45],
        GH: [215, 105, 40],
        AU: [240, 100, 130],
        NZ: [235, 110, 140],
      };

      const hashCode = iso.charCodeAt(0) * 31 + iso.charCodeAt(1);
      const fallbackHue = (hashCode * 137) % 360;
      const fallbackR = Math.round(
        128 + 80 * Math.cos((fallbackHue * Math.PI) / 180)
      );
      const fallbackG = Math.round(
        128 + 80 * Math.cos(((fallbackHue - 120) * Math.PI) / 180)
      );
      const fallbackB = Math.round(
        128 + 80 * Math.cos(((fallbackHue - 240) * Math.PI) / 180)
      );

      const base = regionColors[iso] || [fallbackR, fallbackG, fallbackB];
      const r = Math.round(base[0] * intensity);
      const g = Math.round(base[1] * intensity);
      const b = Math.round(base[2] * intensity);

      return `rgba(${r}, ${g}, ${b}, 0.88)`;
    },
    [countryCountMap, maxCount, getIso]
  );

  useEffect(() => {
    const globe = globeRef.current;
    if (globe?.controls) {
      const controls = globe.controls();
      controls.autoRotate = !sidebarOpen;
    }
  }, [sidebarOpen]);

  const handlePolygonClick = useCallback(
    (feat: object) => {
      const feature = feat as GeoFeature;
      const iso = getIso(feature);
      const name =
        COUNTRY_NAMES[iso] ||
        feature.properties.NAME ||
        feature.properties.ADMIN;

      const countryPins = pins.filter((p) => p.job_country === iso);
      let lat = 0;
      let lng = 0;
      if (countryPins.length > 0) {
        lat =
          countryPins.reduce((sum, p) => sum + p.job_latitude, 0) /
          countryPins.length;
        lng =
          countryPins.reduce((sum, p) => sum + p.job_longitude, 0) /
          countryPins.length;
      }

      const globe = globeRef.current;
      if (globe?.controls) {
        globe.controls().autoRotate = false;
      }
      if (globe?.pointOfView && (lat !== 0 || lng !== 0)) {
        globe.pointOfView({ lat, lng, altitude: 2 }, 800);
      }

      onCountrySelect(iso, name);
    },
    [onCountrySelect, pins, getIso]
  );

  const handlePointClick = useCallback(
    (point: object) => {
      const pin = point as JobPin;

      const globe = globeRef.current;
      if (globe?.controls) {
        globe.controls().autoRotate = false;
      }
      if (globe?.pointOfView) {
        globe.pointOfView(
          { lat: pin.job_latitude, lng: pin.job_longitude, altitude: 1.5 },
          800
        );
      }

      onPinSelect(pin);
    },
    [onPinSelect]
  );

  return (
    <div className="globe-container" style={{ width: dimensions.width }}>
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="#00E5A0"
          atmosphereAltitude={0.15}
          polygonsData={polygonsForGlobe}
          polygonCapColor={(d: object) => {
            const feat = d as GeoFeature;
            if (feat === hoverCountry) {
              const iso = getIso(feat);
              const count = countryCountMap.get(iso) || 0;
              return count > 0
                ? "rgba(255, 200, 200, 0.5)"
                : "rgba(40, 40, 60, 0.6)";
            }
            return getCountryColor(feat);
          }}
          polygonSideColor={() => "rgba(255, 255, 255, 0.04)"}
          polygonStrokeColor={(d: object) => {
            const feat = d as GeoFeature;
            if (feat === hoverCountry) {
              const iso = getIso(feat);
              const count = countryCountMap.get(iso) || 0;
              return count > 0
                ? "rgba(255, 60, 60, 0.9)"
                : "rgba(255, 255, 255, 0.12)";
            }
            return "rgba(255, 255, 255, 0.12)";
          }}
          polygonAltitude={(d: object) =>
            (d as GeoFeature) === hoverCountry ? 0.03 : 0.008
          }
          polygonLabel={(d: object) => {
            const feat = d as GeoFeature;
            const iso = getIso(feat);
            const name =
              COUNTRY_NAMES[iso] ||
              feat.properties.NAME ||
              feat.properties.ADMIN;
            const count = countryCountMap.get(iso) || 0;
            return `
              <div style="
                background: rgba(18, 18, 26, 0.95);
                border: 1px solid rgba(0, 229, 160, 0.3);
                border-radius: 8px;
                padding: 8px 14px;
                font-family: system-ui;
                backdrop-filter: blur(10px);
              ">
                <div style="color: #F0F0F5; font-size: 13px; font-weight: 600;">${escapeHtml(name)}</div>
                <div style="color: #00E5A0; font-size: 12px; margin-top: 2px;">${count} job${count !== 1 ? "s" : ""}</div>
              </div>
            `;
          }}
          onPolygonHover={(d: object | null) => {
            setHoverCountry(d as GeoFeature | null);
            const globe = globeRef.current;
            if (globe?.controls) {
              globe.controls().autoRotate = d === null && !sidebarOpen;
            }
          }}
          onPolygonClick={handlePolygonClick}
          pointsData={pins}
          pointLat={(d: object) => (d as JobPin).job_latitude}
          pointLng={(d: object) => (d as JobPin).job_longitude}
          pointColor={(d: object) => {
            if (!aiMode || !matchScores) return "#FF4D4D";
            const pin = d as JobPin;
            const score = matchScores[pin.job_id] || 0;
            return getMatchColor(score);
          }}
          pointAltitude={(d: object) => {
            if (!aiMode || !matchScores) return 0.04;
            const pin = d as JobPin;
            const score = matchScores[pin.job_id] || 0;
            return score >= 70 ? 0.08 : score >= 40 ? 0.06 : 0.03;
          }}
          pointRadius={(d: object) => {
            if (!aiMode || !matchScores) return 0.12;
            const pin = d as JobPin;
            const score = matchScores[pin.job_id] || 0;
            return score >= 70 ? 0.2 : score >= 40 ? 0.15 : 0.08;
          }}
          pointLabel={(d: object) => {
            const pin = d as JobPin;
            const score =
              aiMode && matchScores ? matchScores[pin.job_id] || 0 : 0;
            const matchLine =
              aiMode && score > 0
                ? `<div style="color: ${getMatchColor(score)}; font-size: 12px; font-weight: 700; margin-top: 3px;">${score}% Match</div>`
                : "";
            const borderColor =
              aiMode && score > 0
                ? getMatchColor(score)
                : "rgba(255, 77, 77, 0.4)";
            return `
              <div style="
                background: rgba(18, 18, 26, 0.95);
                border: 1px solid ${borderColor};
                border-radius: 8px;
                padding: 8px 14px;
                font-family: system-ui;
                backdrop-filter: blur(10px);
                max-width: 250px;
              ">
                <div style="color: #F0F0F5; font-size: 13px; font-weight: 600;">${escapeHtml(pin.job_title)}</div>
                <div style="color: #8888A0; font-size: 11px; margin-top: 2px;">${escapeHtml(pin.employer_name)}</div>
                <div style="color: #FF4D4D; font-size: 11px; margin-top: 2px;">${escapeHtml(pin.job_city || "")}, ${escapeHtml(pin.job_country)}</div>
                ${matchLine}
              </div>
            `;
          }}
          onPointHover={(d: object | null) => {
            const globe = globeRef.current;
            if (globe?.controls) {
              globe.controls().autoRotate = d === null && !sidebarOpen;
            }
          }}
          onPointClick={handlePointClick}
          labelsData={matchLabels}
          labelLat={(d: object) => (d as MatchLabel).lat}
          labelLng={(d: object) => (d as MatchLabel).lng}
          labelText={(d: object) => (d as MatchLabel).text}
          labelColor={(d: object) => getMatchColor((d as MatchLabel).score)}
          labelSize={1.4}
          labelDotRadius={0.3}
          labelDotOrientation={() => "bottom" as const}
          labelAltitude={0.08}
          labelResolution={2}
          labelLabel={(d: object) => {
            const label = d as MatchLabel;
            const color = getMatchColor(label.score);
            return `
              <div style="
                background: rgba(18, 18, 26, 0.95);
                border: 1px solid ${color}40;
                border-radius: 10px;
                padding: 8px 12px;
                font-family: system-ui;
                backdrop-filter: blur(10px);
                max-width: 220px;
              ">
                <div style="color: ${color}; font-size: 14px; font-weight: 800;">${label.score}% Match</div>
                <div style="color: #F0F0F5; font-size: 12px; margin-top: 3px; font-weight: 600;">${escapeHtml(label.title)}</div>
                <div style="color: #8888A0; font-size: 10px; margin-top: 2px;">${escapeHtml(label.company)}</div>
              </div>
            `;
          }}
        />
      )}
    </div>
  );
}
