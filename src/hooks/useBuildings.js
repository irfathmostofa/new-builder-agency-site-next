"use client";

import { useEffect, useState } from "react";
import {
  getBuildings,
  getBuilding,
  getBuildingImages,
  peekBuilding,
  peekBuildingImages,
  peekBuildings,
} from "../lib/queries";

export function useBuildings({ featuredOnly = false, typeSlug = null } = {}) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBuildings() {
      const existing = peekBuildings({ featuredOnly, typeSlug });
      if (existing !== undefined) {
        setBuildings(existing);
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        const data = await getBuildings({ featuredOnly, typeSlug });
        if (!cancelled) {
          setBuildings(data ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchBuildings();
    return () => {
      cancelled = true;
    };
  }, [featuredOnly, typeSlug]);

  return { buildings, loading, error };
}

export function useBuilding(slug) {
  const cachedBuilding = slug ? peekBuilding(slug) : null;
  const cachedImages = cachedBuilding?.id ? peekBuildingImages(cachedBuilding.id) : undefined;
  const [building, setBuilding] = useState(cachedBuilding ?? null);
  const [images, setImages] = useState(cachedImages ?? []);
  const [loading, setLoading] = useState(!cachedBuilding);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const existing = peekBuilding(slug);
    if (existing) {
      setBuilding(existing);
      const existingImages = peekBuildingImages(existing.id);
      if (existingImages) setImages(existingImages);
      setError(null);
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function fetchBuilding() {
      try {
        const buildingData = await getBuilding(slug);
        if (cancelled) return;
        if (!buildingData) {
          setError(new Error("Not found"));
          setLoading(false);
          return;
        }
        setBuilding(buildingData);
        const imageData = await getBuildingImages(buildingData.id);
        if (!cancelled) {
          setImages(imageData ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchBuilding();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { building, images, loading, error };
}
