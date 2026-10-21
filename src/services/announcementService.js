import { api } from "./apiClient";

// 1. ดึงประกาศที่กำลัง Active สำหรับหน้าแรกของเว็บไซต์ (Public)
export async function getActiveAnnouncements() {
  try {
    const res = await api.get("/announcements/active");
    return res.announcements || [];
  } catch (error) {
    console.error("Error fetching active announcements:", error);
    return [];
  }
}

// 2. ดึงรายการประกาศทั้งหมดสำหรับแอดมิน (Admin Only)
export async function getAdminAnnouncements() {
  try {
    const res = await api.get("/announcements/admin");
    return res.announcements || [];
  } catch (error) {
    console.error("Error fetching admin announcements:", error);
    throw error;
  }
}

// 3. สร้างประกาศข่าวใหม่ (Admin Only)
export async function createAnnouncement(data) {
  try {
    const res = await api.post("/announcements", data);
    return res.announcement;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
}

// 4. แก้ไขประกาศข่าว (Admin Only)
export async function updateAnnouncement(id, data) {
  try {
    const res = await api.put(`/announcements/${id}`, data);
    return res.announcement;
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
}

// 5. ลบประกาศข่าว (Admin Only)
export async function deleteAnnouncement(id) {
  try {
    const res = await api.delete(`/announcements/${id}`);
    return res;
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
}

// 6. อัปโหลดรูปภาพประกาศ
export async function uploadAnnouncementImage(file) {
  try {
    const res = await api.upload(file);
    return res.url;
  } catch (error) {
    console.error("Error uploading announcement image:", error);
    throw error;
  }
}
