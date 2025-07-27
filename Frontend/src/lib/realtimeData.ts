import { collection, getDocs, query, } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const getUserReports = async () => {
  try {
    // Create a query against the user_summary collection
    const eventsQuery = query(
      collection(db, 'event_summary'),
    );

    // Get the documents
    const querySnapshot = await getDocs(eventsQuery);
    
    // Map the documents to a more usable format
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      CreatedAt: doc.data().CreatedAt ? new Date(doc.data().CreatedAt) : new Date(),
    }));

    return reports;
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }
}

export const getLocalityEvents = async (locality: string) => {
  const res = await fetch("https://metropulse-api-j3ktzbq5hq-uc.a.run.app/get-location-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ location: locality }),
  });

  if (!res.ok) throw new Error("Failed to fetch locality events");
  return await res.json();
};

export const getCityEvents = async (city: string) => {
  const res = await fetch("https://metropulse-api-j3ktzbq5hq-uc.a.run.app/get-location-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ location: city }),
  });

  if (!res.ok) throw new Error("Failed to fetch city events");
  return await res.json();
};