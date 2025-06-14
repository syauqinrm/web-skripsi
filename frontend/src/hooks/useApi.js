import { useState, useEffect } from "react";
import apiService from "../services/api";

export const useDetections = (page = 1, perPage = 10) => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchDetections = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDetections(page, perPage);

      if (response.success) {
        setDetections(response.detections);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, [page, perPage]);

  return {
    detections,
    loading,
    error,
    pagination,
    refetch: fetchDetections,
  };
};

export const useStats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStats();

      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useDetection = (detectionId) => {
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetection = async () => {
    if (!detectionId) return;

    try {
      setLoading(true);
      const response = await apiService.getDetection(detectionId);

      if (response.success) {
        setDetection(response.detection);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetection();
  }, [detectionId]);

  return {
    detection,
    loading,
    error,
    refetch: fetchDetection,
  };
};
