import { api } from "./apiClient";

// 1. ดึงรายการพื้นที่/โซนทั้งหมด
export async function getLocations() {
  try {
    const res = await api.get("/locations");
    return Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

// 2. แอดมินเพิ่มพื้นที่ใหม่
export async function addLocation(name, description = "") {
  try {
    const res = await api.post("/admin/locations", { name, description });
    return res;
  } catch (error) {
    console.error("Error adding location:", error);
    throw error;
  }
}

// 3. แอดมินแก้ไขพื้นที่
export async function updateLocation(id, name, description = "") {
  try {
    const res = await api.put(`/admin/locations/${id}`, { name, description });
    return res;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
}

// 4. แอดมินลบพื้นที่
export async function deleteLocation(id) {
  try {
    const res = await api.delete(`/admin/locations/${id}`);
    return res;
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
}

// 5. เจ้าของหอพักอัปเดตตำแหน่งพิกัดหอพัก (พร้อม Sync ลง Firebase Firestore)
export async function updateDormLocation(dormId, { latitude, longitude }) {
  try {
    // 5.1 อัปเดตผ่าน Express API
    const res = await api.put(`/dormitories/${dormId}`, {
      latitude: Number(latitude),
      longitude: Number(longitude)
    });

    // 5.2 ซิงก์ลง Firebase Firestore (ตาม requirement ข้อ 9)
    try {
      const { db } = await import("../firebase/config");
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      if (db) {
        const dormDocRef = doc(db, "dorms", String(dormId));
        await setDoc(dormDocRef, {
          latitude: Number(latitude),
          longitude: Number(longitude),
          locationStatus: "pending",
          locationUpdatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (fbErr) {
      console.warn("Firestore sync location update warning:", fbErr);
    }

    return res.dormitory;
  } catch (error) {
    console.error("Error updating dorm location:", error);
    throw error;
  }
}

// 6. แอดมินตรวจสอบและยืนยัน / ส่งกลับแก้ไขตำแหน่งพิกัดหอพัก
export async function verifyDormLocation(dormId, status, rejectReason = "") {
  try {
    // 6.1 อัปเดตผ่าน Express API
    const res = await api.patch(`/dormitories/${dormId}/location-status`, {
      status, // 'verified' | 'action_needed'
      rejectReason
    });

    // 6.2 ซิงก์สถานะลง Firebase Firestore
    try {
      const { db } = await import("../firebase/config");
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      if (db) {
        const dormDocRef = doc(db, "dorms", String(dormId));
        await setDoc(dormDocRef, {
          locationStatus: status === "rejected" ? "action_needed" : status,
          locationVerifiedAt: status === "verified" ? serverTimestamp() : null,
          locationRejectReason: status === "action_needed" || status === "rejected" ? rejectReason : null
        }, { merge: true });
      }
    } catch (fbErr) {
      console.warn("Firestore sync location verification warning:", fbErr);
    }

    return res.dormitory;
  } catch (error) {
    console.error("Error verifying dorm location:", error);
    throw error;
  }
}
