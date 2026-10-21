import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RATING_OPTIONS = [
  { value: 5, label: "5 ดาว (ยอดเยี่ยม)", stars: 5 },
  { value: 4, label: "4 ดาว (ดีมาก)", stars: 4 },
  { value: 3, label: "3 ดาว (ปานกลาง)", stars: 3 },
  { value: 2, label: "2 ดาว (พอใช้)", stars: 2 },
  { value: 1, label: "1 ดาว (ต้องปรับปรุง)", stars: 1 }
];
import SearchableSelect from "../../components/common/SearchableSelect";
import DormCard from "../../components/dorm/DormCard";
import { getDormitoryById, incrementDormView, getApprovedDormitories } from "../../services/dormitoryService";
import { recordDormView } from "../../services/historyService";
import { getRoomsByDormitory } from "../../services/roomService";
import { getReviewsByDormitory, createReview, replyToReview, updateReview, deleteReview } from "../../services/reviewService";
import { createBooking, getBookingsByUser } from "../../services/bookingService";
import { isFavorite, addFavorite, removeFavorite } from "../../services/favoriteService";
import { getLocations } from "../../services/locationService";
import { showConfirm, showAlert } from "../../context/ModalContext";
import MapPreview from "../../components/map/MapPreview";

const DEFAULT_LOCATIONS = [
  "กำเนิดเพชร",
  "เชียงคาน",
  "ราชภัฏเลย",
  "โรงพยาบาลเลย",
  "โรงเรียนเลยพิท",
  "เมืองเลย",
  "นาอาน",
  "กุดป่อง"
];

const PRICE_OPTIONS = [
  "ต่ำกว่า 2,000 บาท",
  "2,000 - 3,000 บาท",
  "3,000 - 5,000 บาท",
  "มากกว่า 5,000 บาท"
];

const ROOM_TYPE_OPTIONS = [
  "ห้องพัดลม",
  "ห้องแอร์",
  "ห้องสตูดิโอ"
];

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const DEFAULT_OTHER_DORMS = [
  { id: "sample-1", name: "หอพัก อเธน่า", district: "เมืองเลย", address: "อ.เมือง จ.เลย", bedroomCount: 1, priceMin: 3500, priceMax: 3500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-2", name: "หอพัก ภูผาอินทร์", district: "เมืองเลย", address: "อ.เมือง จ.เลย", bedroomCount: 1, priceMin: 3500, priceMax: 3500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-3", name: "บ้านพักสบาย เชียงคาน", district: "เชียงคาน", address: "อ.เชียงคาน จ.เลย", bedroomCount: 1, priceMin: 4000, priceMax: 4000, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "เครื่องทำน้ำอุ่น"] },
  { id: "sample-4", name: "หอพัก อานนท์", district: "เมืองเลย", address: "อ.เมือง จ.เลย", bedroomCount: 1, priceMin: 3500, priceMax: 3500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องพัดลม", "ฟรี WiFi", "ที่จอดรถ"] },
];

export default function DormDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, userRole } = useAuth();

  const [dorm, setDorm] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [otherDorms, setOtherDorms] = useState([]);
  const [favorited, setFavorited] = useState(false);
  const [userBooking, setUserBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Search Bar Form State
  const [searchName, setSearchName] = useState("");
  const [district, setDistrict] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [roomType, setRoomType] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [locationOptions, setLocationOptions] = useState(DEFAULT_LOCATIONS);
  const [dormNameOptions, setDormNameOptions] = useState([]);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);
  const ratingDropdownRef = useRef(null);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Edit Review State
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [reviewMenuOpenId, setReviewMenuOpenId] = useState(null);

  // Booking Modal Room Dropdown State
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const roomDropdownRef = useRef(null);

  // Booking Modal Calendar Dropdown State
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Recommended Dorms Slider Ref & Scroll Handler
  const otherDormsScrollRef = useRef(null);
  const scrollOtherDorms = (direction) => {
    if (otherDormsScrollRef.current) {
      const scrollAmount = otherDormsScrollRef.current.clientWidth;
      otherDormsScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    document.body.classList.add("dorm-detail-page");
    return () => {
      document.body.classList.remove("dorm-detail-page");
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(e.target)) {
        setRatingDropdownOpen(false);
      }
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(e.target)) {
        setRoomDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
      if (!e.target.closest(".dorm-detail-review-menu-container")) {
        setReviewMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Reply Review State for Admin & Owner
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    async function loadData(isInitial = true) {
      if (isInitial) setLoading(true);
      try {
        const dormData = await getDormitoryById(id);
        if (dormData) {
          setDorm(dormData);
          if (isInitial) {
            incrementDormView(id);
            if (currentUser) {
              recordDormView(id);
            }
          }

          const [roomList, reviewList] = await Promise.all([
            getRoomsByDormitory(id),
            getReviewsByDormitory(id)
          ]);
          setRooms(roomList);
          setReviews(reviewList);

          if (currentUser) {
            const userId = currentUser.id || currentUser.uid;
            const fav = await isFavorite(userId, id);
            setFavorited(fav);

            try {
              const userBookings = await getBookingsByUser(userId);
              const match = userBookings.find((b) => (b.dormitoryId === id || b.dormitory_id === id) && b.status !== "cancelled");
              setUserBooking(match || null);
            } catch (err) {
              console.error("Error loading user booking status:", err);
            }
          }
        } else {
          // Fallback sample data if document not found
          setDorm({
            id,
            name: "สุขุมวิท พลัส เรสซิเดนซ์ (Sukhumvit Plus Residence)",
            tagline: "ตอบโจทย์ชีวิตเมือง สะดวก ปลอดภัย เสมือนอยู่บ้าน",
            district: "เมืองเลย",
            address: "234 ม.11 ต.เมือง อ.เมือง จ.เลย 42000",
            description: "หอพักทันสมัยสไตล์โมเดิร์น เดินทางสะดวก ใกล้สถานีรถไฟฟ้าและมหาวิทยาลัย พร้อมระบบรักษาความปลอดภัย 24 ชั่วโมง และสิ่งอำนวยความสะดวกครบครัน",
            priceMin: 3500,
            priceMax: 4000,
            phone: "042-123-456",
            lineId: "@sukhumvitplus",
            amenities: ["แอร์", "WiFi", "ที่จอดรถ", "กล้องวงจรปิด", "คีย์การ์ด", "เครื่องทำน้ำอุ่น", "ระเบียง"],
            roomTypes: ["ห้องแอร์", "ห้องสตูดิโอ"],
            images: [
              "/images/dorm-1.jpg",
              "/images/dorm-2.jpg",
              "/images/dorm-hero.jpg",
              "/images/banner.jpg"
            ],
            rating: 4.8,
            reviewCount: 12
          });
        }

        if (isInitial) {
          // Fetch location options & all dorm names for search select & recommended grid
          const locs = await getLocations();
          if (locs && locs.length > 0) {
            setLocationOptions(locs.map((l) => l.name));
          }

          const allDorms = await getApprovedDormitories({});
          if (allDorms && allDorms.length > 0) {
            setDormNameOptions(Array.from(new Set(allDorms.map((d) => d.name).filter(Boolean))));
            const filteredOther = allDorms.filter((d) => d.id !== id);
            setOtherDorms(filteredOther.length >= 4 ? filteredOther : [...filteredOther, ...DEFAULT_OTHER_DORMS]);
          } else {
            setDormNameOptions(["สุขุมวิท พลัส เรสซิเดนซ์", "หอพัก อเธน่า", "หอพัก ภูผาอินทร์", "บ้านพักสบาย เชียงคาน", "หอพัก อานนท์"]);
            setOtherDorms(DEFAULT_OTHER_DORMS);
          }
        }
      } catch (err) {
        console.error("Error loading dorm detail:", err);
        if (isInitial) setOtherDorms(DEFAULT_OTHER_DORMS);
      } finally {
        if (isInitial) setLoading(false);
      }
    }

    loadData(true);

    // Real-time polling every 3 seconds for instant status updates when owner changes room status
    const pollInterval = setInterval(() => {
      loadData(false);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [id, currentUser]);

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (userRole === "admin") {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "สำหรับผู้ดูแลระบบ",
        message: "ผู้ดูแลระบบสามารถเข้าดูและจัดการข้อมูลเท่านั้น ไม่สามารถบันทึกไปยังรายการโปรดได้ครับ",
        type: "warning"
      });
      return;
    }
    try {
      const userId = currentUser.id || currentUser.uid;
      if (favorited) {
        const isConfirmed = await showConfirm({
          title: "นำออกจากรายการที่บันทึก",
          heading: "ต้องการนำหอพักนี้ออกจากรายการที่บันทึกไว้ใช่หรือไม่?",
          confirmText: "นำออก",
          cancelText: "ยกเลิก",
          type: "danger"
        });
        if (!isConfirmed) return;

        await removeFavorite(userId, id);
        setFavorited(false);
        await showAlert({
          title: "สำเร็จ",
          heading: "นำออกจากรายการที่บันทึกแล้ว",
          type: "success"
        });
      } else {
        const isFav = await addFavorite(userId, id);
        setFavorited(isFav);
        await showAlert({
          title: "บันทึกเรียบร้อย",
          heading: "บันทึกหอพักนี้แล้ว!",
          message: "คุณสามารถดูย้อนหลังได้ที่หน้า 'หอพักที่บันทึกไว้'",
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchName.trim()) params.append("name", searchName.trim());
    if (district) params.append("district", district);
    if (priceRange) params.append("priceRange", priceRange);
    if (roomType) params.append("roomType", roomType);

    navigate(`/dorms?${params.toString()}`);
  };

  const handleCategoryClick = (catName) => {
    setActiveCategory(catName);
    if (catName === "ทั้งหมด") {
      navigate("/dorms");
    } else {
      navigate(`/dorms?category=${encodeURIComponent(catName)}`);
    }
  };

  const handleOpenBookingModal = async (room = null) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (userRole === "admin") {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "สำหรับผู้ดูแลระบบ",
        message: "ผู้ดูแลระบบสามารถเข้าดูข้อมูลหอพักและห้องพักได้เท่านั้น ไม่สามารถทำการจองห้องพักได้ครับ",
        type: "warning"
      });
      return;
    }
    const targetRoom = room || rooms.find(r => r.status === 'available' || !r.status) || rooms[0] || null;
    setSelectedRoom(targetRoom);
    setCalendarOpen(false);
    setCalendarMonth(new Date());
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (userRole === "admin") {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "สำหรับผู้ดูแลระบบ",
        message: "ผู้ดูแลระบบสามารถเข้าดูข้อมูลหอพักและห้องพักได้เท่านั้น ไม่สามารถทำการจองห้องพักได้ครับ",
        type: "warning"
      });
      return;
    }
    if (!bookingDate) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "กรุณาเลือกวันที่",
        message: "กรุณาเลือกวันที่ต้องการเข้าพักก่อนส่งคำขอจอง",
        type: "warning"
      });
      return;
    }

    setBookingSubmitting(true);
    try {
      await createBooking({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData?.displayName || currentUser.email,
        userPhone: userData?.phone || "",
        ownerId: dorm.ownerId || "system",
        dormitoryId: id,
        dormitoryName: dorm.name,
        roomId: selectedRoom?.id || "general",
        roomNumber: selectedRoom?.roomNumber || "ห้องมาตรฐาน",
        bookingDate,
        note: bookingNote
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingSuccess(false);
        navigate("/user/bookings");
      }, 1500);
    } catch (err) {
      console.error("Booking error:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถจองห้องพักได้",
        message: "เกิดข้อผิดพลาดในการจองห้องพัก กรุณาลองใหม่อีกครั้ง",
        type: "danger"
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setReviewSubmitting(true);
    try {
      const roleLabel = userRole === "admin" ? " (ผู้ดูแลระบบ)" : userRole === "owner" ? " (เจ้าของหอพัก)" : "";
      const baseName = userData?.displayName || userData?.fullName || currentUser.displayName || currentUser.email?.split("@")[0] || "ผู้ใช้งาน";
      const finalUserName = baseName.includes("(") ? baseName : `${baseName}${roleLabel}`;

      await createReview({
        userId: currentUser.id || currentUser.uid,
        userName: finalUserName,
        userPhoto: userData?.avatarUrl || userData?.photoURL || currentUser.photoURL || "/images/default-avatar.jpg",
        dormitoryId: id,
        rating,
        comment
      });

      const updatedReviews = await getReviewsByDormitory(id);
      setReviews(updatedReviews);
      setComment("");
      await showAlert({
        title: "สำเร็จ",
        heading: "ส่งรีวิวเรียบร้อยแล้ว!",
        message: "ขอบคุณสำหรับความคิดเห็นของคุณครับ",
        type: "success"
      });
    } catch (err) {
      console.error("Review error:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถส่งรีวิวได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;

    const isConfirmed = await showConfirm({
      title: "ตอบกลับรีวิว",
      heading: "ยืนยันการส่งคำตอบกลับรีวิวนี้ใช่หรือไม่?",
      confirmText: "ส่งคำตอบ",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    setReplySubmitting(true);
    try {
      await replyToReview(reviewId, replyText.trim());
      const updatedReviews = await getReviewsByDormitory(id);
      setReviews(updatedReviews);
      setReplyingReviewId(null);
      setReplyText("");
      await showAlert({
        title: "สำเร็จ",
        heading: "บันทึกการตอบกลับเรียบร้อยแล้ว!",
        type: "success"
      });
    } catch (err) {
      console.error("Error replying to review:", err);
      const msg = err?.error || err?.message || "ไม่สามารถบันทึกการตอบกลับได้";
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถบันทึกการตอบกลับได้",
        message: msg,
        type: "danger"
      });
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleOpenEditReview = async (rev) => {
    const baseTime = rev.createdAt || rev.updatedAt;
    if (baseTime && (Date.now() - new Date(baseTime).getTime() > 60000)) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "หมดเวลาสำหรับการแก้ไขรีวิวแล้ว",
        message: "สามารถแก้ไขได้ภายใน 1 นาทีหลังเขียนรีวิวเท่านั้นครับ",
        type: "warning"
      });
      return;
    }
    setEditingReview(rev);
    setEditRating(rev.rating || 5);
    setEditComment(rev.comment || "");
  };

  const handleSaveEditReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    const baseTime = editingReview.createdAt || editingReview.updatedAt;
    if (baseTime && (Date.now() - new Date(baseTime).getTime() > 60000)) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "หมดเวลาสำหรับการแก้ไขรีวิวแล้ว",
        message: "สามารถแก้ไขได้ภายใน 1 นาทีหลังเขียนรีวิวเท่านั้นครับ",
        type: "warning"
      });
      setEditingReview(null);
      return;
    }

    const isConfirmed = await showConfirm({
      title: "แก้ไขรีวิว",
      heading: "ยืนยันการบันทึกการแก้ไขรีวิวใช่หรือไม่?",
      message: "ความคิดเห็นและคะแนนดาวจะถูกอัปเดตตามข้อมูลใหม่",
      confirmText: "บันทึกการแก้ไข",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    setEditSaving(true);
    try {
      await updateReview(editingReview.id, editComment, editRating);
      setEditingReview(null);
      await showAlert({
        title: "สำเร็จ",
        heading: "บันทึกการแก้ไขรีวิวเรียบร้อยแล้ว!",
        type: "success"
      });
      const updated = await getReviewsByDormitory(id);
      setReviews(updated);
    } catch (err) {
      console.error("Error updating review:", err);
      const msg = err?.error || err?.message || "ไม่สามารถแก้ไขรีวิวได้";
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถแก้ไขรีวิวได้",
        message: msg,
        type: "danger"
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const isConfirmed = await showConfirm({
      title: "ลบรีวิว",
      heading: "คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?",
      message: "รีวิวและคะแนนที่คุณให้ไว้จะถูกลบออกจากระบบอย่างถาวร",
      confirmText: "ลบรีวิว",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (isConfirmed) {
      try {
        await deleteReview(reviewId);
        await showAlert({
          title: "ลบรีวิวสำเร็จ",
          heading: "ลบรีวิวเรียบร้อยแล้ว!",
          message: "ข้อมูลรีวิวถูกลบออกจากระบบแล้ว",
          type: "success"
        });
        const updated = await getReviewsByDormitory(id);
        setReviews(updated);
      } catch (err) {
        console.error("Error deleting review:", err);
        const msg = err?.error || err?.message || "ไม่สามารถลบรีวิวได้";
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถลบรีวิวได้",
          message: msg,
          type: "danger"
        });
      }
    }
  };

  const handleContactOwner = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const targetOwnerId = dorm?.ownerId || "0f9be26f-766e-4914-991a-ee51506ae407";
    const targetOwnerName = dorm?.ownerName || "เจ้าของหอพัก";
    const targetDormName = dorm?.name || "";
    const targetDormId = dorm?.id || id || "";

    const basePath = userRole === "admin"
      ? "/admin/messages"
      : userRole === "owner"
        ? "/owner/messages"
        : "/user/messages";

    navigate(`${basePath}?ownerId=${targetOwnerId}&dormId=${targetDormId}&ownerName=${encodeURIComponent(targetOwnerName)}&dormName=${encodeURIComponent(targetDormName)}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: "#5b8e66", fontSize: "18px", background: "#f8faf8", minHeight: "100vh" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "10px" }}></i> กำลังโหลดรายละเอียดหอพัก...
      </div>
    );
  }

  if (!dorm) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", background: "#f8faf8", minHeight: "100vh" }}>
        <h2>ไม่พบข้อมูลหอพักที่ค้นหา</h2>
        <Link to="/dorms" style={{ color: "#5b8e66" }}>กลับสู่หน้ารายการหอพัก</Link>
      </div>
    );
  }

  const dormImages = (dorm.images && dorm.images.length > 0)
    ? dorm.images
    : ["/images/dorm-1.jpg", "/images/dorm-2.jpg", "/images/dorm-hero.jpg", "/images/banner.jpg"];

  const displayThumbnails = [...dormImages];
  while (displayThumbnails.length < 4) {
    displayThumbnails.push(dormImages[displayThumbnails.length % dormImages.length]);
  }

  const categories = [
    { name: "ทั้งหมด", icon: "fa-solid fa-table-cells-large" },
    { name: "ใกล้มหาวิทยาลัย", icon: "fa-solid fa-graduation-cap" },
    { name: "ใกล้โรงพยาบาล", icon: "fa-solid fa-hospital" },
    { name: "ใกล้ห้าง", icon: "fa-solid fa-shop" },
    { name: "ใกล้ขนส่ง", icon: "fa-solid fa-bus" },
  ];

  return (
    <div className="dorm-detail-wrapper" style={{ background: "#ffffff", minHeight: "100vh", fontFamily: '"Noto Sans Thai", sans-serif', overflowX: "hidden" }}>
      {/* Mobile Topbar with Back Chevron */}
      <div className="dorm-detail-mobile-topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="dorm-detail-topbar-back"
          aria-label="ย้อนกลับ"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="dorm-detail-topbar-title">รายละเอียดหอพัก</h2>
      </div>

      <div className="dorm-detail-container" style={{ maxWidth: "1120px", margin: "0 auto", padding: "24px 30px 60px" }}>
        {/* Breadcrumb Navigation */}
        <div className="dorm-detail-breadcrumb" style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px", display: "flex", gap: "6px", alignItems: "center" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none", fontWeight: 500 }}>หน้าแรก</Link>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <Link to="/dorms" style={{ color: "#64748b", textDecoration: "none", fontWeight: 500 }}>ค้นหาหอพัก</Link>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>รายละเอียด</span>
        </div>

        {/* Main Dormitory Details Container Card */}
        <div className="dorm-detail-main-card" style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid #e8eee8",
          marginBottom: "32px"
        }}>
          <div className="dorm-detail-main-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "32px",
            alignItems: "start"
          }}>
            {/* Left Column: Image Gallery & Favorite Action */}
            <div className="dorm-detail-gallery-col">
              {/* Main Featured Photo */}
              <div
                className="dorm-detail-main-img-box"
                onClick={() => setLightboxOpen(true)}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "280px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "16px",
                  cursor: "pointer",
                  background: "#e2e8f0"
                }}
              >
                <img
                  src={dormImages[activeImageIndex] || dormImages[0]}
                  alt={dorm.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s"
                  }}
                  onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                />
              </div>

              {/* 4 Thumbnail Strip with Arrow Overlay Buttons */}
              <div className="dorm-detail-thumbs-grid" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
                {displayThumbnails.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className="dorm-detail-thumb-item"
                    onClick={() => setActiveImageIndex(idx % dormImages.length)}
                    style={{
                      position: "relative",
                      height: "75px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: (activeImageIndex % dormImages.length) === (idx % dormImages.length) ? "3px solid #5b8e66" : "2px solid transparent",
                      opacity: (activeImageIndex % dormImages.length) === (idx % dormImages.length) ? 1 : 0.8,
                      transition: "all 0.2s"
                    }}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                    />
                    
                    {/* Left arrow on 1st thumbnail */}
                    {idx === 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev - 1 + dormImages.length) % dormImages.length);
                        }}
                        style={{
                          position: "absolute",
                          left: "4px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0, 0, 0, 0.4)",
                          color: "#fff",
                          border: "none",
                          width: "22px",
                          height: "22px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                    )}

                    {/* Right arrow on 4th thumbnail */}
                    {idx === 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev + 1) % dormImages.length);
                        }}
                        style={{
                          position: "absolute",
                          right: "4px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0, 0, 0, 0.4)",
                          color: "#fff",
                          border: "none",
                          width: "22px",
                          height: "22px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Favorite Action Button */}
              {userRole !== "admin" ? (
                <button
                  type="button"
                  className="btn-fav-no-hover dorm-detail-fav-btn"
                  onClick={handleToggleFavorite}
                  style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: favorited ? "#2e7d32" : "#2d4a32",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 0"
                  }}
                >
                  <i className={favorited ? "fa-solid fa-heart" : "fa-regular fa-heart"} style={{ color: "#3d6a45", fontSize: "20px" }}></i>
                  <span>{favorited ? "บันทึกไปยังรายการโปรดแล้ว" : "บันทึกไปยังรายการโปรด"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-fav-no-hover"
                  onClick={handleToggleFavorite}
                  style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#9ca3af",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "not-allowed",
                    padding: "4px 0",
                    opacity: 0.65
                  }}
                  title="บทบาทผู้ดูแลระบบไม่สามารถบันทึกรายการโปรดได้"
                >
                  <i className="fa-regular fa-heart" style={{ color: "#9ca3af", fontSize: "20px" }}></i>
                  <span>บันทึกไปยังรายการโปรด (เฉพาะสมาชิก)</span>
                </button>
              )}
            </div>

            {/* Right Column: Title, Subtitle, Price, Description & Action Buttons */}
            <div className="dorm-detail-info-col" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                {/* User Booking Status Badge */}
                {userBooking && (
                  <div className="dorm-detail-booking-badge-wrapper" style={{ marginBottom: "12px" }}>
                    {userBooking.status === "approved" ? (
                      <span style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        border: "1px solid #86efac",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <i className="fa-solid fa-circle-check"></i> คุณได้รับการอนุมัติการจองหอพักนี้แล้ว (จองแล้ว)
                      </span>
                    ) : userBooking.status === "pending" ? (
                      <span style={{
                        background: "#fef3c7",
                        color: "#b45309",
                        border: "1px solid #fde68a",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <i className="fa-solid fa-clock"></i> คำขอจองหอพักของคุณกำลังรออนุมัติ
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Dorm Name */}
                <h1 className="dorm-detail-title" style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1e293b",
                  lineHeight: "1.3",
                  marginBottom: "6px"
                }}>
                  {dorm.name}
                </h1>

                {/* Subtitle / Tagline */}
                <p className="dorm-detail-tagline" style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "16px"
                }}>
                  {dorm.tagline || "ตอบโจทย์ชีวิตเมือง สะดวก ปลอดภัย เสมือนอยู่บ้าน"}
                </p>

                {/* Price */}
                <div className="dorm-detail-price" style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#f59e0b",
                  marginBottom: "16px"
                }}>
                  {Number(dorm.priceMin || dorm.price || 1000).toLocaleString()} บาท / เดือน
                </div>

                {/* Description */}
                <p className="dorm-detail-desc" style={{
                  fontSize: "14px",
                  color: "#334155",
                  lineHeight: "1.7",
                  marginBottom: "24px",
                  whiteSpace: "pre-line"
                }}>
                  {dorm.description || "หอพักทันสมัยสไตล์โมเดิร์น เดินทางสะดวก ใกล้สถานีรถไฟฟ้าและมหาวิทยาลัย พร้อมระบบรักษาความปลอดภัย 24 ชั่วโมง และสิ่งอำนวยความสะดวกครบครัน"}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="dorm-detail-action-buttons" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "auto", paddingTop: "16px" }}>
                {/* Book Button */}
                {userRole !== "admin" && (
                  userBooking?.status === "approved" ? (
                    <button
                      type="button"
                      disabled
                      className="dorm-detail-btn-book"
                      style={{
                        background: "#dcfce7",
                        color: "#166534",
                        border: "1px solid #86efac",
                        padding: "10px 24px",
                        borderRadius: "6px",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "default",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <i className="fa-solid fa-circle-check"></i>
                      จองแล้ว (อนุมัติแล้ว)
                    </button>
                  ) : userBooking?.status === "pending" ? (
                    <button
                      type="button"
                      disabled
                      className="dorm-detail-btn-book"
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                        padding: "10px 24px",
                        borderRadius: "6px",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "default",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <i className="fa-solid fa-clock"></i>
                      รออนุมัติการจอง
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal()}
                      className="dorm-detail-btn-book"
                      style={{
                        background: "#5b8e66",
                        color: "#fff",
                        border: "none",
                        padding: "10px 24px",
                        borderRadius: "6px",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 2px 6px rgba(91,142,102,0.3)",
                        transition: "background 0.2s"
                      }}
                    >
                      <i className="fa-regular fa-file-lines" style={{ fontSize: "16px" }}></i>
                      จองหอพัก
                    </button>
                  )
                )}

                {/* Contact Button */}
                {userRole !== "owner" && (
                  <button
                    type="button"
                    onClick={handleContactOwner}
                    className="dorm-detail-btn-contact"
                    style={{
                      background: "#f0f7f0",
                      color: "#5b8e66",
                      border: "1.5px solid #a3cca8",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    <i className="fa-solid fa-phone" style={{ fontSize: "15px" }}></i>
                    ติดต่อหอพัก
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Content Sections: Details, Amenities, Rooms, Reviews */}
        <div className="dorm-detail-lower-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          
          {/* Facilities & Address Card */}
          <div className="dorm-detail-section-card" style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "18px", color: "#2d3748", marginBottom: "16px", borderBottom: "2px solid #edf2f7", paddingBottom: "10px", fontWeight: 700 }}>
              <i className="fa-solid fa-list-check" style={{ color: "#5b8e66", marginRight: "8px" }}></i>
              สิ่งอำนวยความสะดวก
            </h3>
            <div className="dorm-detail-amenities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {(dorm.amenities || ["แอร์", "WiFi", "ที่จอดรถ", "กล้องวงจรปิด", "เครื่องทำน้ำอุ่น", "คีย์การ์ด"]).map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4a5568", fontSize: "14px" }}>
                  <i className="fa-solid fa-circle-check" style={{ color: "#5b8e66" }}></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "18px", color: "#2d3748", marginBottom: "12px", borderBottom: "2px solid #edf2f7", paddingBottom: "10px", fontWeight: 700 }}>
              <i className="fa-solid fa-location-dot" style={{ color: "#5b8e66", marginRight: "8px" }}></i>
              ทำเลที่ตั้ง
            </h3>
            <p style={{ color: "#4a5568", fontSize: "14px", lineHeight: "1.6" }}>
              {dorm.address || `อำเภอ${dorm.district || "เมืองเลย"} จังหวัดเลย`}
            </p>
          </div>

          {/* Contact Owner Info Card */}
          <div className="dorm-detail-section-card" style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "18px", color: "#2d3748", marginBottom: "16px", borderBottom: "2px solid #edf2f7", paddingBottom: "10px", fontWeight: 700 }}>
              <i className="fa-solid fa-id-card" style={{ color: "#5b8e66", marginRight: "8px" }}></i>
              ช่องทางติดต่อเจ้าของหอพัก
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8faf8", padding: "12px 16px", borderRadius: "10px" }}>
                <i className="fa-solid fa-phone" style={{ color: "#5b8e66", fontSize: "18px" }}></i>
                <div>
                  <div style={{ fontSize: "12px", color: "#718096" }}>เบอร์โทรศัพท์</div>
                  <strong style={{ fontSize: "15px", color: "#2d3748" }}>{dorm.phone || "042-123-456"}</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8faf8", padding: "12px 16px", borderRadius: "10px" }}>
                <i className="fa-brands fa-line" style={{ color: "#06c755", fontSize: "20px" }}></i>
                <div>
                  <div style={{ fontSize: "12px", color: "#718096" }}>LINE ID</div>
                  <strong style={{ fontSize: "15px", color: "#2d3748" }}>{dorm.lineId || "@yooloeihouse"}</strong>
                </div>
              </div>

              {userRole !== "owner" && (
                <button
                  type="button"
                  onClick={handleContactOwner}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "12px",
                    background: "#5b8e66",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <i className="fa-solid fa-comments"></i>
                  แชทสอบถามกับผู้ดูแลหอพัก
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section: ตำแหน่งหอพัก (Dorm Location Map - Collapsible Dropdown) */}
        <div className="dorm-detail-section-card" style={{ background: "#fff", padding: "20px 24px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "32px" }}>
          <div
            onClick={() => setIsMapOpen((prev) => !prev)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#2d3748", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fa-solid fa-map-location-dot" style={{ color: "#5b8e66" }}></i>
                ตำแหน่งหอพัก
              </h3>
              {dorm.locationStatus === "verified" ? (
                <span style={{ fontSize: "12px", background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: "20px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <i className="fa-solid fa-circle-check"></i> ยืนยันพิกัดแล้ว
                </span>
              ) : (
                <span style={{ fontSize: "12px", background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <i className="fa-solid fa-clock"></i> รอตรวจสอบพิกัด
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMapOpen((prev) => !prev);
              }}
              style={{
                background: isMapOpen ? "#e8f5e9" : "#f1f5f9",
                color: isMapOpen ? "#2e7d32" : "#334155",
                border: isMapOpen ? "1px solid #a5d6a7" : "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <i className="fa-solid fa-map"></i>
              <span>{isMapOpen ? "ย่อแผนที่" : "แสดงแผนที่พิกัด"}</span>
              <i className={`fa-solid fa-chevron-${isMapOpen ? "up" : "down"}`}></i>
            </button>
          </div>

          <p style={{ color: "#4a5568", fontSize: "14px", lineHeight: "1.6", margin: "10px 0 0 0" }}>
            <i className="fa-solid fa-location-dot" style={{ color: "#e53e3e", marginRight: "6px" }}></i>
            <strong>ที่อยู่:</strong> {dorm.address || `อำเภอ${dorm.district || "เมืองเลย"} จังหวัดเลย`}
          </p>

          {isMapOpen && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #edf2f7" }}>
              <MapPreview
                latitude={dorm.latitude}
                longitude={dorm.longitude}
                dormName={dorm.name}
                address={dorm.address || `อำเภอ${dorm.district || "เมืองเลย"} จังหวัดเลย`}
                height="240px"
                zoom={15}
                showControls={true}
              />
            </div>
          )}
        </div>

        {/* Rooms List Section */}
        {rooms.length > 0 && (
          <div className="dorm-detail-section-card" style={{ background: "#fff", padding: "28px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#2d3748", marginBottom: "18px" }}>
              <i className="fa-solid fa-door-open" style={{ color: "#5b8e66", marginRight: "10px" }}></i>
              รายการห้องพักที่มีว่าง
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {rooms.map((room) => (
                <div key={room.id} className="dorm-detail-room-item" style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "#f8faf8",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#2d3748" }}>ห้อง {room.roomNumber}</strong>
                    <span style={{ marginLeft: "12px", color: "#718096", fontSize: "14px" }}>({room.roomType})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "14.5px", whiteSpace: "nowrap" }}>{Number(room.price).toLocaleString()} บาท/เดือน</span>
                    {(() => {
                      const isReserved = room.status === "reserved" || room.status === "booked" || (userBooking?.roomId === room.id && userBooking?.status === "approved");
                      const isAvailable = room.status === "available" && !isReserved;

                      return (
                        <>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            background: isAvailable ? "#dcfce7" : isReserved ? "#fef3c7" : "#fee2e2",
                            color: isAvailable ? "#166534" : isReserved ? "#92400e" : "#991b1b"
                          }}>
                            {isAvailable ? "ห้องว่าง" : isReserved ? "จองแล้ว" : "ไม่ว่าง"}
                          </span>
                          {isAvailable && userRole !== "admin" && (!userBooking || userBooking.status !== "approved") ? (
                            <button
                              onClick={() => handleOpenBookingModal(room)}
                              style={{
                                background: "#5b8e66",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                cursor: "pointer",
                                transition: "background 0.15s ease"
                              }}
                            >
                              จองห้องนี้
                            </button>
                          ) : isReserved ? (
                            <span style={{ color: "#92400e", fontSize: "11.5px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", flexShrink: 0 }}>
                              <i className="fa-solid fa-lock"></i> จองแล้ว
                            </span>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews & Ratings Section */}
        <div className="dorm-detail-section-card" style={{ background: "#fff", padding: "28px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#2d3748", marginBottom: "20px" }}>
            <i className="fa-solid fa-star" style={{ color: "#f59e0b", marginRight: "10px" }}></i>
            รีวิวจากผู้เข้าพัก ({reviews.length})
          </h3>

          {/* Write Review Form - Available for all roles (ทุกบทบาทสามารถเขียนรีวิวกี่ครั้งก็ได้) */}
          <form onSubmit={handleReviewSubmit} className="dorm-detail-review-form" style={{ background: "#f8faf8", padding: "20px", borderRadius: "12px", marginBottom: "28px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: 700, color: "#2d3748" }}>เขียนรีวิวความประทับใจ</h4>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#4a5568" }}>ให้คะแนนหอพัก</label>
                
                {/* Interactive Star Buttons & Selected Rating Label */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="dorm-detail-star-btn"
                        style={{
                          background: "none",
                          border: "none",
                          padding: "2px",
                          fontSize: "24px",
                          color: star <= rating ? "#f59e0b" : "#d1d5db",
                          cursor: "pointer",
                          transition: "transform 0.15s ease, color 0.15s ease"
                        }}
                        aria-label={`${star} ดาว`}
                      >
                        <i className="fa-solid fa-star"></i>
                      </button>
                    ))}
                  </div>
                  <span style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#b45309",
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    display: "inline-flex",
                    alignItems: "center"
                  }}>
                    {rating === 5 && "5 ดาว (ยอดเยี่ยม)"}
                    {rating === 4 && "4 ดาว (ดีมาก)"}
                    {rating === 3 && "3 ดาว (ปานกลาง)"}
                    {rating === 2 && "2 ดาว (พอใช้)"}
                    {rating === 1 && "1 ดาว (ต้องปรับปรุง)"}
                  </span>
                </div>

                {/* Custom Responsive Dropdown - Guaranteed strictly bounded within card/screen */}
                <div ref={ratingDropdownRef} style={{ position: "relative", width: "100%" }}>
                  <button
                    type="button"
                    onClick={() => setRatingDropdownOpen(!ratingDropdownOpen)}
                    className="dorm-detail-rating-trigger"
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: ratingDropdownOpen ? "1.5px solid #5b8e66" : "1px solid #cbd5e0",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      outline: "none",
                      transition: "all 0.2s ease",
                      boxShadow: ratingDropdownOpen ? "0 0 0 3px rgba(91,142,102,0.15)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <span style={{ color: "#f59e0b", fontSize: "14px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                        {"★".repeat(rating)}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#2d3748", whiteSpace: "nowrap" }}>
                        {RATING_OPTIONS.find((o) => o.value === rating)?.label || `${rating} ดาว`}
                      </span>
                    </div>
                    <i
                      className="fa-solid fa-chevron-down"
                      style={{
                        fontSize: "12px",
                        color: "#718096",
                        transition: "transform 0.2s ease",
                        transform: ratingDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        marginLeft: "8px",
                        flexShrink: 0
                      }}
                    ></i>
                  </button>

                  {/* Dropdown Menu Popup - 100% width, stays inside card/screen */}
                  {ratingDropdownOpen && (
                    <div
                      className="dorm-detail-rating-menu"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        width: "100%",
                        maxWidth: "100%",
                        background: "#ffffff",
                        border: "1px solid #cbd5e0",
                        borderRadius: "8px",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                        zIndex: 100,
                        overflow: "hidden",
                        boxSizing: "border-box",
                        padding: "4px 0"
                      }}
                    >
                      {RATING_OPTIONS.map((opt) => {
                        const isSelected = rating === opt.value;
                        return (
                          <div
                            key={opt.value}
                            onClick={() => {
                              setRating(opt.value);
                              setRatingDropdownOpen(false);
                            }}
                            style={{
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              background: isSelected ? "#f0fdf4" : "transparent",
                              transition: "background 0.15s ease",
                              boxSizing: "border-box"
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "#f8faf8";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                              <span style={{ color: "#f59e0b", fontSize: "14px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                                {"★".repeat(opt.stars)}
                              </span>
                              <span style={{
                                fontSize: "14px",
                                color: isSelected ? "#166534" : "#2d3748",
                                fontWeight: isSelected ? 700 : 500,
                                whiteSpace: "nowrap"
                              }}>
                                {opt.label}
                              </span>
                            </div>
                            {isSelected && (
                              <i className="fa-solid fa-check" style={{ color: "#166534", fontSize: "13px" }}></i>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600, color: "#4a5568" }}>ความคิดเห็น</label>
                <textarea
                  rows={3}
                  className="dorm-detail-review-textarea"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e0",
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontSize: "14px",
                    lineHeight: "1.5"
                  }}
                  placeholder="บอกเล่าความรู้สึก หรือบรรยากาศการพักอาศัยที่นี่..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="dorm-detail-review-submit-btn"
                style={{
                  background: "#5b8e66",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                {reviewSubmitting ? "กำลังส่งรีวิว..." : "ส่งรีวิว"}
              </button>
            </form>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p style={{ color: "#718096", fontSize: "15px" }}>ยังไม่มีรีวิวสำหรับหอพักนี้ มาเป็นคนแรกที่รีวิวกันครับ!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {reviews.map((rev) => {
                const avatarSrc = rev.userPhoto || "/images/default-avatar.jpg";
                return (
                  <div key={rev.id} className="dorm-detail-review-item" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={avatarSrc}
                          alt={rev.userName || "ผู้รีวิว"}
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #e2e8f0"
                          }}
                          onError={(e) => { e.target.src = "/images/default-avatar.jpg"; }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "14.5px" }}>
                            {rev.userName || "ผู้ใช้งาน"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ color: "#f59e0b", fontSize: "12px", letterSpacing: "1px" }}>
                              {"⭐".repeat(rev.rating || 5)}
                            </span>
                            {rev.createdAt && <span>• {new Date(rev.createdAt).toLocaleDateString("th-TH")}</span>}
                          </div>
                        </div>
                      </div>

                      {/* 3-dots vertical menu on the right for edit / delete */}
                      {currentUser && (currentUser.id === rev.userId || currentUser.uid === rev.userId || currentUser.role === "admin" || currentUser.role === "superadmin") && (
                        (() => {
                          const isReviewOwner = currentUser.id === rev.userId || currentUser.uid === rev.userId;
                          const baseTime = rev.createdAt || rev.updatedAt;
                          const isEditable = !baseTime || (Date.now() - new Date(baseTime).getTime() < 60000);
                          const isOpen = reviewMenuOpenId === rev.id;

                          return (
                            <div className="dorm-detail-review-menu-container" style={{ position: "relative", marginLeft: "auto" }}>
                              <button
                                type="button"
                                onClick={() => setReviewMenuOpenId(isOpen ? null : rev.id)}
                                style={{
                                  background: isOpen ? "#f1f5f9" : "transparent",
                                  border: "1px solid",
                                  borderColor: isOpen ? "#cbd5e1" : "transparent",
                                  color: isOpen ? "#1e293b" : "#64748b",
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  fontSize: "15px",
                                  transition: "all 0.15s ease"
                                }}
                                onMouseEnter={(e) => {
                                  if (!isOpen) {
                                    e.currentTarget.style.background = "#f8fafc";
                                    e.currentTarget.style.color = "#1e293b";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isOpen) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#64748b";
                                  }
                                }}
                                title="ตัวเลือกเพิ่มเติม"
                                aria-label="ตัวเลือกเพิ่มเติม"
                              >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </button>

                              {isOpen && (
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "calc(100% + 4px)",
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                                    minWidth: "165px",
                                    padding: "6px",
                                    zIndex: 100
                                  }}
                                >
                                  {isReviewOwner && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReviewMenuOpenId(null);
                                        handleOpenEditReview(rev);
                                      }}
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "8px 12px",
                                        border: "none",
                                        background: "transparent",
                                        color: isEditable ? "#1e293b" : "#94a3b8",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        textAlign: "left"
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                      <i
                                        className={isEditable ? "fa-solid fa-pen-to-square" : "fa-solid fa-lock"}
                                        style={{ color: isEditable ? "#5b8e66" : "#94a3b8", width: "16px" }}
                                      ></i>
                                      <span>{isEditable ? "แก้ไขรีวิว (1 นาที)" : "แก้ไข (หมดเวลา)"}</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewMenuOpenId(null);
                                      handleDeleteReview(rev.id);
                                    }}
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "8px 12px",
                                      border: "none",
                                      background: "transparent",
                                      color: "#ef4444",
                                      fontSize: "13px",
                                      fontWeight: 500,
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      textAlign: "left"
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <i className="fa-regular fa-trash-can" style={{ color: "#ef4444", width: "16px" }}></i>
                                    <span>ลบรีวิว</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                    <p className="dorm-detail-review-comment" style={{ color: "#334155", fontSize: "14px", marginLeft: "50px", lineHeight: 1.6, margin: "4px 0 0 50px" }}>{rev.comment}</p>
                    
                    {rev.ownerReply && (
                      <div
                        className="dorm-detail-review-reply"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          marginTop: "10px",
                          marginLeft: "50px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img
                              src={rev.ownerReplyPhoto || "/images/default-avatar.jpg"}
                              alt={rev.ownerReplyName || "ผู้ตอบกลับ"}
                              style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover", border: "1px solid #cbd5e1" }}
                              onError={(e) => { e.target.src = "/images/default-avatar.jpg"; }}
                            />
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ color: "#1e293b", fontSize: "13.5px", fontWeight: 600 }}>
                                {rev.ownerReplyName || (rev.ownerReplyRole === "admin" ? "ผู้ดูแลระบบ" : "เจ้าของหอพัก")}
                              </span>
                              <span style={{
                                background: rev.ownerReplyRole === "admin" ? "#eff6ff" : "#f0fdf4",
                                color: rev.ownerReplyRole === "admin" ? "#2563eb" : "#166534",
                                border: rev.ownerReplyRole === "admin" ? "1px solid #dbeafe" : "1px solid #dcfce7",
                                padding: "1px 7px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}>
                                <i className={rev.ownerReplyRole === "admin" ? "fa-solid fa-shield-halved" : "fa-solid fa-building-user"} style={{ fontSize: "9px" }}></i>
                                {rev.ownerReplyRole === "admin" ? "ผู้ดูแลระบบ" : "เจ้าของหอพัก"}
                              </span>
                            </div>
                          </div>

                          {(userRole === "admin" || userRole === "owner") && replyingReviewId !== rev.id && (
                            (() => {
                              const isEditable = !rev.ownerReplyAt || (Date.now() - new Date(rev.ownerReplyAt).getTime() < 60000);
                              return isEditable ? (
                                <button
                                  type="button"
                                  onClick={() => { setReplyingReviewId(rev.id); setReplyText(rev.ownerReply); }}
                                  style={{ background: "none", border: "none", color: "#5b8e66", fontSize: "12px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                  <i className="fa-solid fa-pen-to-square"></i> แก้ไขคำตอบ (ภายใน 1 นาที)
                                </button>
                              ) : (
                                <span style={{ fontSize: "11.5px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "4px" }} title="ครบกำหนด 1 นาทีแล้ว ไม่สามารถแก้ไขคำได้">
                                  <i className="fa-solid fa-lock" style={{ fontSize: "10px" }}></i> หมดเวลาแก้ไข
                                </span>
                              );
                            })()
                          )}
                        </div>
                        <p style={{ color: "#334155", margin: 0, fontSize: "13.5px", lineHeight: "1.6" }}>{rev.ownerReply}</p>
                      </div>
                    )}

                    {(userRole === "admin" || userRole === "owner") && !rev.ownerReply && replyingReviewId !== rev.id && (
                      <div style={{ marginLeft: "50px", marginTop: "10px" }}>
                        <button
                          type="button"
                          onClick={() => { setReplyingReviewId(rev.id); setReplyText(""); }}
                          style={{ background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", padding: "5px 12px", borderRadius: "6px", fontSize: "12.5px", cursor: "pointer", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "5px" }}
                        >
                          <i className="fa-solid fa-reply" style={{ color: "#5b8e66" }}></i> ตอบกลับรีวิวนี้
                        </button>
                      </div>
                    )}

                    {(userRole === "admin" || userRole === "owner") && replyingReviewId === rev.id && (
                      <div style={{ marginLeft: "54px", marginTop: "12px", background: "#f8faf7", padding: "14px", borderRadius: "8px", border: "1.5px solid #5b8e66" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#2d3748", marginBottom: "6px" }}>
                          {userRole === "admin" ? "ตอบกลับในฐานะผู้ดูแลระบบ" : "ตอบกลับในฐานะเจ้าของหอพัก"}
                        </label>
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="พิมพ์ข้อความตอบกลับ..."
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", fontFamily: "inherit", fontSize: "14px", resize: "none" }}
                        ></textarea>
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(rev.id)}
                            disabled={replySubmitting}
                            style={{ background: "#5b8e66", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                          >
                            {replySubmitting ? "กำลังส่ง..." : "บันทึกคำตอบ"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setReplyingReviewId(null); setReplyText(""); }}
                            style={{ background: "#fff", color: "#4a5568", border: "1px solid #cbd5e0", padding: "6px 14px", borderRadius: "4px", fontSize: "13px", cursor: "pointer" }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =====================================================
            RECOMMENDED DORMS SLIDER SECTION (Horizontal Desktop & Mobile)
        ===================================================== */}
        <div className="dorm-detail-other-dorms" style={{ marginTop: "40px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-solid fa-thumbs-up" style={{ color: "#5b8e66", fontSize: "20px" }}></i>
            หอพักแนะนำอื่นๆ
          </h3>

          <div
            ref={otherDormsScrollRef}
            className="dorm-detail-other-grid"
          >
            {(otherDorms.length > 0 ? otherDorms : DEFAULT_OTHER_DORMS).slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="dorm-detail-other-card-wrapper"
              >
                <DormCard dorm={item} showFavorite={false} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal (Full Screen View) */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.92)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "36px",
              cursor: "pointer",
              zIndex: 10
            }}
          >
            &times;
          </button>

          <img
            src={dormImages[activeImageIndex]}
            alt="Full size view"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: "8px"
            }}
            onError={(e) => { e.target.src = "/images/banner.jpg"; }}
          />

          {dormImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + dormImages.length) % dormImages.length);
                }}
                style={{
                  position: "absolute",
                  left: "24px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  border: "none",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  fontSize: "24px",
                  cursor: "pointer"
                }}
              >
                &#10094;
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % dormImages.length);
                }}
                style={{
                  position: "absolute",
                  right: "24px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  border: "none",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  fontSize: "24px",
                  cursor: "pointer"
                }}
              >
                &#10095;
              </button>
            </>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }}>
          <div className="dorm-detail-booking-modal-card" style={{
            background: "#fff",
            width: "100%",
            maxWidth: "500px",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            boxSizing: "border-box"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "20px", color: "#2d3748", fontWeight: 700 }}>จองห้องพัก: {dorm.name}</h3>
              <button
                onClick={() => { setBookingModalOpen(false); setRoomDropdownOpen(false); setCalendarOpen(false); }}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#a0aec0" }}
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#2e7d32" }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: "48px", marginBottom: "12px" }}></i>
                <h3>ส่งคำขอจองห้องพักเรียบร้อยแล้ว!</h3>
                <p style={{ color: "#718096", marginTop: "6px" }}>เจ้าของหอจะตรวจสอบและตอบรับการจองของคุณในเร็วๆ นี้ครับ</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}>
                    ห้องพักที่ต้องการจอง
                  </label>
                  {rooms && rooms.length > 0 ? (
                    (() => {
                      const activeRoom = selectedRoom || rooms.find(r => r.status === 'available' || !r.status) || rooms[0];
                      const isReservedActive = activeRoom?.status === "reserved" || activeRoom?.status === "booked";

                      return (
                        <div ref={roomDropdownRef} style={{ position: "relative", width: "100%" }}>
                          {/* Trigger button */}
                          <button
                            type="button"
                            onClick={() => { setRoomDropdownOpen(!roomDropdownOpen); setCalendarOpen(false); }}
                            className="dorm-detail-room-trigger"
                            style={{
                              width: "100%",
                              minHeight: "44px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: roomDropdownOpen ? "1.5px solid #5b8e66" : "1px solid #cbd5e0",
                              background: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              boxSizing: "border-box",
                              outline: "none",
                              transition: "all 0.2s ease",
                              boxShadow: roomDropdownOpen ? "0 0 0 3px rgba(91,142,102,0.15)" : "none",
                              textAlign: "left"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", minWidth: 0, flex: 1 }}>
                              <i className="fa-solid fa-door-open" style={{ color: "#5b8e66", fontSize: "14px", flexShrink: 0 }}></i>
                              <span style={{ fontSize: "14px", fontWeight: 600, color: "#2d3748", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {activeRoom ? `ห้อง ${activeRoom.roomNumber} (${activeRoom.roomType}) - ${Number(activeRoom.price).toLocaleString()} บาท/ด.` : "เลือกห้องพัก"}
                              </span>
                              {activeRoom && (
                                <span style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  background: isReservedActive ? "#fee2e2" : "#dcfce7",
                                  color: isReservedActive ? "#991b1b" : "#166534",
                                  flexShrink: 0
                                }}>
                                  {isReservedActive ? "จองแล้ว" : "ว่าง"}
                                </span>
                              )}
                            </div>
                            <i
                              className="fa-solid fa-chevron-down"
                              style={{
                                fontSize: "12px",
                                color: "#718096",
                                transition: "transform 0.2s ease",
                                transform: roomDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                marginLeft: "8px",
                                flexShrink: 0
                              }}
                            ></i>
                          </button>

                          {/* Dropdown Menu Popup - 100% strictly bounded within card/screen */}
                          {roomDropdownOpen && (
                            <div
                              className="dorm-detail-room-menu"
                              style={{
                                position: "absolute",
                                top: "calc(100% + 4px)",
                                left: 0,
                                right: 0,
                                width: "100%",
                                maxWidth: "100%",
                                maxHeight: "220px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                background: "#ffffff",
                                border: "1px solid #cbd5e0",
                                borderRadius: "8px",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                                zIndex: 1000,
                                boxSizing: "border-box",
                                padding: "4px 0"
                              }}
                            >
                              {rooms.map((rm) => {
                                const isReserved = rm.status === "reserved" || rm.status === "booked";
                                const isSelected = (selectedRoom?.id || rooms[0]?.id) === rm.id;
                                return (
                                  <div
                                    key={rm.id}
                                    onClick={() => {
                                      if (!isReserved) {
                                        setSelectedRoom(rm);
                                        setRoomDropdownOpen(false);
                                      }
                                    }}
                                    style={{
                                      padding: "10px 12px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      cursor: isReserved ? "not-allowed" : "pointer",
                                      background: isSelected ? "#f0fdf4" : "transparent",
                                      opacity: isReserved ? 0.6 : 1,
                                      transition: "background 0.15s ease",
                                      boxSizing: "border-box",
                                      borderBottom: "1px solid #f1f5f9"
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSelected && !isReserved) e.currentTarget.style.background = "#f8faf8";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSelected && !isReserved) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", minWidth: 0, flex: 1, paddingRight: "8px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <strong style={{ fontSize: "14px", color: isSelected ? "#166534" : "#2d3748" }}>
                                          ห้อง {rm.roomNumber}
                                        </strong>
                                        <span style={{ fontSize: "12px", color: "#718096" }}>
                                          ({rm.roomType})
                                        </span>
                                      </div>
                                      <div style={{ fontSize: "12.5px", color: "#f59e0b", fontWeight: 600 }}>
                                        {Number(rm.price).toLocaleString()} บาท/เดือน
                                      </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                      <span style={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        background: isReserved ? "#fee2e2" : "#dcfce7",
                                        color: isReserved ? "#991b1b" : "#166534"
                                      }}>
                                        {isReserved ? "จองแล้ว" : "ว่าง"}
                                      </span>
                                      {isSelected && !isReserved && (
                                        <i className="fa-solid fa-check" style={{ color: "#166534", fontSize: "13px" }}></i>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={selectedRoom ? `ห้อง ${selectedRoom.roomNumber} (${selectedRoom.roomType}) - ${selectedRoom.price} บาท/เดือน` : "ห้องมาตรฐาน"}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8faf8", boxSizing: "border-box" }}
                    />
                  )}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}>
                    วันที่ต้องการเข้าพัก <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  {(() => {
                    const curYear = calendarMonth.getFullYear();
                    const curMonth = calendarMonth.getMonth();
                    const firstDayOfWeek = new Date(curYear, curMonth, 1).getDay();
                    const totalDaysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
                    const prevMonthLastDay = new Date(curYear, curMonth, 0).getDate();

                    const todayObj = new Date();
                    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

                    return (
                      <div ref={calendarRef} className="dorm-detail-calendar-container" style={{ position: "relative", width: "100%" }}>
                        {/* Trigger button */}
                        <button
                          type="button"
                          onClick={() => { setCalendarOpen(!calendarOpen); setRoomDropdownOpen(false); }}
                          className="dorm-detail-calendar-trigger"
                          style={{
                            width: "100%",
                            minHeight: "44px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: calendarOpen ? "1.5px solid #5b8e66" : "1px solid #cbd5e0",
                            background: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            boxSizing: "border-box",
                            fontSize: "14px",
                            color: bookingDate ? "#1a202c" : "#718096",
                            outline: "none",
                            transition: "all 0.2s ease",
                            boxShadow: calendarOpen ? "0 0 0 3px rgba(91,142,102,0.15)" : "none",
                            textAlign: "left"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, overflow: "hidden", flex: 1 }}>
                            <i className="fa-regular fa-calendar" style={{ color: bookingDate ? "#5b8e66" : "#a0aec0", fontSize: "15px", flexShrink: 0 }}></i>
                            <span style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", fontWeight: bookingDate ? 600 : 400 }}>
                              {bookingDate ? (() => {
                                const [y, m, d] = bookingDate.split("-");
                                return `${parseInt(d, 10)} ${THAI_MONTHS[parseInt(m, 10) - 1]} ${parseInt(y, 10) + 543} (${d}/${m}/${y})`;
                              })() : "วว/ดด/ปปปป (คลิกเลือกวันที่)"}
                            </span>
                          </div>
                          <i
                            className={`fa-solid fa-chevron-${calendarOpen ? "up" : "down"}`}
                            style={{ fontSize: "12px", color: "#718096", flexShrink: 0, marginLeft: "8px" }}
                          ></i>
                        </button>

                        {/* Calendar Dropdown Menu - 100% strictly bounded within card/screen */}
                        {calendarOpen && (
                          <div
                            className="dorm-detail-calendar-menu"
                            style={{
                              position: "absolute",
                              top: "calc(100% + 4px)",
                              left: 0,
                              right: 0,
                              width: "100%",
                              maxWidth: "100%",
                              background: "#ffffff",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                              border: "1px solid #e2e8f0",
                              zIndex: 1001,
                              padding: "12px",
                              boxSizing: "border-box"
                            }}
                          >
                            {/* Header: Month Name + Year + Prev/Next */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                              <button
                                type="button"
                                onClick={() => setCalendarMonth(new Date(curYear, curMonth - 1, 1))}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "6px",
                                  width: "30px",
                                  height: "30px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  color: "#4a5568",
                                  fontSize: "12px"
                                }}
                              >
                                <i className="fa-solid fa-chevron-left"></i>
                              </button>
                              <span style={{ fontWeight: 600, fontSize: "14px", color: "#2d3748" }}>
                                {THAI_MONTHS[curMonth]} {curYear + 543}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCalendarMonth(new Date(curYear, curMonth + 1, 1))}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "6px",
                                  width: "30px",
                                  height: "30px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  color: "#4a5568",
                                  fontSize: "12px"
                                }}
                              >
                                <i className="fa-solid fa-chevron-right"></i>
                              </button>
                            </div>

                            {/* Weekdays */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "6px", textAlign: "center" }}>
                              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((dayLabel, i) => (
                                <div key={dayLabel} style={{ fontSize: "12px", fontWeight: 600, color: i === 0 ? "#e53e3e" : "#718096", padding: "2px 0" }}>
                                  {dayLabel}
                                </div>
                              ))}
                            </div>

                            {/* Days Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center" }}>
                              {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
                                const prevDateNum = prevMonthLastDay - firstDayOfWeek + idx + 1;
                                return (
                                  <div key={`prev-${idx}`} style={{ padding: "6px 0", fontSize: "12px", color: "#cbd5e0", userSelect: "none" }}>
                                    {prevDateNum}
                                  </div>
                                );
                              })}

                              {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                                const dayNum = idx + 1;
                                const dateFormatted = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                const isSelected = bookingDate === dateFormatted;
                                const isToday = dateFormatted === todayStr;
                                const isPast = dateFormatted < todayStr;

                                return (
                                  <button
                                    key={dateFormatted}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => {
                                      setBookingDate(dateFormatted);
                                      setCalendarOpen(false);
                                    }}
                                    style={{
                                      padding: "6px 0",
                                      fontSize: "13px",
                                      fontWeight: isSelected ? 700 : isToday ? 600 : 500,
                                      color: isSelected ? "#fff" : isPast ? "#cbd5e0" : isToday ? "#166534" : "#2d3748",
                                      background: isSelected ? "#5b8e66" : isToday ? "#dcfce7" : "transparent",
                                      border: isToday && !isSelected ? "1px solid #86efac" : "none",
                                      borderRadius: "6px",
                                      cursor: isPast ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      lineHeight: "1.2"
                                    }}
                                  >
                                    {dayNum}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #edf2f7" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setBookingDate("");
                                  setCalendarOpen(false);
                                }}
                                style={{ background: "none", border: "none", color: "#e53e3e", fontSize: "12px", cursor: "pointer", padding: "4px 6px" }}
                              >
                                ล้างค่า
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBookingDate(todayStr);
                                  setCalendarMonth(new Date());
                                  setCalendarOpen(false);
                                }}
                                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "12px", borderRadius: "6px", cursor: "pointer", padding: "4px 10px", fontWeight: 600 }}
                              >
                                วันนี้
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}>
                    ข้อความถึงเจ้าของหอ (ถ้ามี)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="เช่น สัญญาเช่า 6 เดือน / มีรถยนต์ 1 คัน หรือสอบถามเพิ่มเติม"
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e0", fontFamily: "inherit", resize: "none", boxSizing: "border-box" }}
                  ></textarea>
                </div>

                <div className="dorm-detail-modal-btn-row" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => { setBookingModalOpen(false); setRoomDropdownOpen(false); setCalendarOpen(false); }}
                    className="dorm-detail-modal-btn-cancel"
                    style={{ padding: "10px 18px", border: "1px solid #cbd5e0", background: "#fff", color: "#4a5568", borderRadius: "8px", cursor: "pointer" }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="dorm-detail-modal-btn-submit"
                    style={{ padding: "10px 22px", border: "none", background: "#5b8e66", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                  >
                    {bookingSubmitting ? "กำลังส่งคำขอ..." : "ยืนยันการจอง"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !editSaving) setEditingReview(null);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "480px",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              boxSizing: "border-box"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="fa-solid fa-pen-to-square" style={{ color: "#5b8e66" }}></i> แก้ไขรีวิว
                </h3>
                <p style={{ color: "#64748b", fontSize: "12.5px", margin: "4px 0 0 0" }}>
                  แก้ไขความคิดเห็นและคะแนนดาวสำหรับ {dorm?.name || "หอพักนี้"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !editSaving && setEditingReview(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEditReview}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13.5px", fontWeight: 600, color: "#334155" }}>
                  คะแนนความพึงพอใจ
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditRating(s)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: editRating === s ? "#f59e0b" : "#e2e8f0",
                        background: editRating === s ? "#fffbeb" : "#ffffff",
                        color: editRating === s ? "#b45309" : "#475569",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: editRating === s ? 700 : 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span style={{ color: "#f59e0b" }}>{"★".repeat(s)}</span>
                      <span>{s} ดาว</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13.5px", fontWeight: 600, color: "#334155" }}>
                  ความคิดเห็น
                </label>
                <textarea
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  required
                  placeholder="บอกเล่าความรู้สึก หรือบรรยากาศการพักอาศัยที่นี่..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    fontSize: "13.5px",
                    fontFamily: "inherit",
                    resize: "none",
                    boxSizing: "border-box",
                    lineHeight: "1.5",
                    color: "#1e293b"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  disabled={editSaving}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#5b8e66",
                    color: "#ffffff",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {editSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      <span>บันทึกการแก้ไข</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
