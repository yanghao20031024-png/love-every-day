"use client";

import { useState, useEffect, useCallback } from "react";

export interface Couple {
  person1: { name: string; avatar: string };
  person2: { name: string; avatar: string };
  startDate: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  images: string[];
  emoji: string;
}

export interface Photo {
  id: string;
  url: string;
  description: string;
  date: string;
  category: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  images: string[];
}

export interface Countdown {
  id: string;
  title: string;
  date: string;
  emoji: string;
}

export interface Letter {
  id: string;
  from: "person1" | "person2";
  to: "person1" | "person2";
  title: string;
  content: string;
  date: string;
  isRead: boolean;
}

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  completed: boolean;
  completedDate?: string;
  createdBy: "person1" | "person2";
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  emoji: string;
  createdBy: "person1" | "person2";
  redeemedBy?: "person1" | "person2";
  redeemedDate?: string;
  isRedeemed: boolean;
}

export interface DailyQuestion {
  id: string;
  date: string;
  question: string;
  answer1?: string;
  answer2?: string;
  answeredBy1: boolean;
  answeredBy2: boolean;
}

export interface LoveData {
  couple: Couple;
  timeline: TimelineEvent[];
  photos: Photo[];
  diary: DiaryEntry[];
  countdowns: Countdown[];
  letters: Letter[];
  wishlist: WishlistItem[];
  coupons: LoveCoupon[];
  dailyQuestions: DailyQuestion[];
}

const defaultData: LoveData = {
  couple: {
    person1: { name: "他", avatar: "" },
    person2: { name: "她", avatar: "" },
    startDate: "2024-01-01",
  },
  timeline: [],
  photos: [],
  diary: [],
  countdowns: [],
  letters: [],
  wishlist: [],
  coupons: [],
  dailyQuestions: [],
};

export function useLoveData() {
  const [data, setData] = useState<LoveData>(defaultData);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data");
      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveData = async (newData: LoveData) => {
    try {
      const res = await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (res.status === 401) {
        window.location.href = "/auth/login";
        return false;
      }
      if (res.ok) {
        setData(newData);
        return true;
      }
    } catch (error) {
      console.error("Failed to save data:", error);
    }
    return false;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.status === 401) {
        window.location.href = "/auth/login";
        return null;
      }
      if (res.ok) {
        const { url } = await res.json();
        return url;
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
    return null;
  };

  return { data, loading, saveData, uploadImage, refresh: fetchData };
}
