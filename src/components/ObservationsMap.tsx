'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Observation, CATEGORIES, IssueCategory } from '@/lib/types';
import { MapPin, Navigation, Eye, AlertTriangle } from 'lucide-react';
import L from 'leaflet';

interface ObservationsMapProps {
  observations: Observation[];
  selectedId: string | null;
  onSelectObservation: (obs: Observation) => void;
}

export default function ObservationsMap({
  observations,
  selectedId,
  onSelectObservation,
}: ObservationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Filter observations that have valid coordinates
  const geoObservations = observations.filter(
    (o) => o.location.latitude !== null && o.location.longitude !== null
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Already initialized

    try {
      // Default center: if there are observations with coords, average them or pick the first one; else default to Bangalore coords or standard
      const defaultCenter: [number, number] =
        geoObservations.length > 0 &&
        geoObservations[0].location.latitude !== null &&
        geoObservations[0].location.longitude !== null
          ? [geoObservations[0].location.latitude, geoObservations[0].location.longitude]
          : [12.9716, 77.5946];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: true,
      });

      // OpenStreetMap Humanitarian / standard tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Invalidate size after layout renders
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } catch (err: any) {
      console.error('Leaflet initialization error:', err);
      setMapError('Interactive map tiles could not be initialized in this browser.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when geoObservations change or selectedId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (geoObservations.length === 0) return;

    const bounds = L.latLngBounds([]);

    geoObservations.forEach((obs) => {
      const lat = obs.location.latitude!;
      const lng = obs.location.longitude!;
      bounds.extend([lat, lng]);

      const catMeta = CATEGORIES[obs.category] || CATEGORIES.other;
      const isSelected = obs.id === selectedId;

      // Create custom SVG DivIcon for crisp, colorful, non-broken icons
      const markerHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? '36px' : '28px'};
          height: ${isSelected ? '36px' : '28px'};
          background-color: ${catMeta.color};
          color: white;
          border-radius: 9999px;
          border: ${isSelected ? '3px solid #14281e' : '2px solid white'};
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        ">
          <span style="font-size: ${isSelected ? '14px' : '11px'}; font-weight: bold;">
            ${obs.category === 'waterlogging' ? '💧' : obs.category === 'blocked_drainage' ? '🚧' : obs.category === 'litter' ? '🗑️' : obs.category === 'damaged_footpath' ? '⚠️' : '📍'}
          </span>
          ${obs.isSampleExample ? '<span style="position: absolute; top: -6px; right: -6px; background: #666; color: #fff; font-size: 8px; padding: 1px 3px; border-radius: 4px;">DEMO</span>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-monsoon-marker',
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectObservation(obs);
      });

      // Tooltip
      marker.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 12px; font-weight: 600; color: #1c3b2c;">
          ${obs.title}
          <div style="font-size: 10px; font-weight: normal; color: #666;">
            ${catMeta.label}
          </div>
        </div>`,
        { direction: 'top', offset: [0, -14] }
      );

      markersGroup.addLayer(marker);
    });

    // Fit map bounds if multiple observations exist and not already user-dragged
    if (bounds.isValid() && geoObservations.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (geoObservations.length === 1) {
      map.setView([geoObservations[0].location.latitude!, geoObservations[0].location.longitude!], 15);
    }
  }, [geoObservations.length, selectedId]);

  // Center map when selected observation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const selectedObs = geoObservations.find((o) => o.id === selectedId);
    if (selectedObs && selectedObs.location.latitude && selectedObs.location.longitude) {
      map.flyTo([selectedObs.location.latitude, selectedObs.location.longitude], 16, {
        duration: 0.8,
      });
    }
  }, [selectedId]);

  // Handle current GPS location centering
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16);

          // Add a temporary blue dot for user
          const userDot = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#2563eb',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          }).bindTooltip('Your Current Position', { permanent: false, direction: 'top' });

          userDot.addTo(mapInstanceRef.current);
        }
      },
      (err) => {
        alert('Could not retrieve your location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  if (mapError) {
    return (
      <div className="w-full h-96 rounded-xl border border-[#ded8cb] bg-[#f6f3ed] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-[#c97a1e] mb-2" />
        <h4 className="font-semibold text-sm text-[#14281e]">Map View Unavailable</h4>
        <p className="text-xs text-[#73827a] max-w-sm mt-1">{mapError}</p>
        <p className="text-xs text-[#55635b] mt-3">
          All observation records remain fully accessible in the timeline and list below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] rounded-xl overflow-hidden border border-[#e3ddd1] shadow-sm bg-[#ece7dd]">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          title="Center on my current GPS location"
          className="p-2.5 bg-[#fbf9f6] hover:bg-[#ffffff] text-[#14281e] rounded-lg shadow-md border border-[#ded8cb] transition-colors"
        >
          <Navigation className="w-4 h-4 text-[#2c6e8a]" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-[#fbf9f6]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#e3ddd1] shadow-sm text-[11px] max-w-xs hidden sm:block">
        <div className="font-mono uppercase text-[#73827a] tracking-wider mb-1.5 font-semibold">
          Observation Legend
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {Object.values(CATEGORIES).map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[#39443e] truncate">{cat.shortLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
