import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, User, Mail, Phone, Calendar, Lock, Users, CreditCard } from "lucide-react";
import * as api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import { validateEmail, validatePassword, validatePasswordMatch, validatePhoneNumber, validateRequired, validateStudentCode } from "../../../lib/validators";

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStudentModal({ isOpen, onClose, onSuccess }: CreateStudentModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [toasts, setToasts] = useState<any[]>([]);
  const { error } = useToast({ toasts, setToasts });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<api.Room[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    full_name: "",
    student_code: "",
    password: "",
    confirmPassword: "",
    dob: "",
    national_id: "",
    email: "",
    phone: "",
    selectedRooms: [] as number[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadRooms();
      // Auto-generate student code suggestion
      generateStudentCode();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    }
  };

  const generateStudentCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData(prev => ({ ...prev, student_code: `STD${timestamp}` }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const nameResult = validateRequired(formData.full_name, 'Full name');
      if (!nameResult.isValid) {
        newErrors.full_name = nameResult.error!;
      }
      
      const dobResult = validateRequired(formData.dob, 'Date of birth');
      if (!dobResult.isValid) {
        newErrors.dob = dobResult.error!;
      }
    }

    if (step === 2) {
      // Email is optional, but validate if provided
      if (formData.email && formData.email.trim()) {
        const emailResult = validateEmail(formData.email);
        if (!emailResult.isValid) {
          newErrors.email = emailResult.error!;
        }
      }
      
      // Phone is optional, but validate if provided
      if (formData.phone && formData.phone.trim()) {
        const phoneResult = validatePhoneNumber(formData.phone);
        if (!phoneResult.isValid) {
          newErrors.phone = phoneResult.error!;
        }
      }
    }

    if (step === 3) {
      const codeResult = validateStudentCode(formData.student_code);
      if (!codeResult.isValid) {
        newErrors.student_code = codeResult.error!;
      }
      
      const passwordResult = validatePassword(formData.password);
      if (!passwordResult.isValid) {
        newErrors.password = passwordResult.error!;
      }
      
      const passwordMatchResult = validatePasswordMatch(formData.password, formData.confirmPassword);
      if (!passwordMatchResult.isValid) {
        newErrors.confirmPassword = passwordMatchResult.error!;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);

      const studentData: api.StudentCreateRequest = {
        full_name: formData.full_name.trim(),
        student_code: formData.student_code.trim(),
        password: formData.password,
        dob: formData.dob || null,
        national_id: formData.national_id.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
      };

      const createdStudent = await api.createStudent(studentData);

      // Add student to selected rooms
      if (formData.selectedRooms.length > 0) {
        await Promise.all(
          formData.selectedRooms.map(roomId =>
            api.addStudentToRoom(roomId, createdStudent.id)
          )
        );
      }

      onSuccess();
    } catch (err: any) {
      console.error("Failed to create student:", err);
      error(err.message || t("students.modal.createError", "فشل إنشاء الطالب"));
    } finally {
      setLoading(false);
    }
  };

  const toggleRoom = (roomId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedRooms: prev.selectedRooms.includes(roomId)
        ? prev.selectedRooms.filter(id => id !== roomId)
        : [...prev.selectedRooms, roomId],
    }));
  };

  if (!isOpen) return null;

  return (
     <div
       className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
       onClick={(e) => {
         if (e.target === e.currentTarget) {
           onClose();
         }
       }}
     >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2 className="text-xl font-bold text-primary-800">
              {t("students.modal.createTitle", "إنشاء طالب جديد")}
            </h2>
            <p className="text-sm text-grey mt-1">
              {t("students.modal.step", "الخطوة")} {currentStep} {t("students.modal.of", "من")} 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-grey hover:text-primary-800 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep ? "bg-primary-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 mb-4">
                {t("students.modal.basicInfo", "المعلومات الأساسية")}
              </h3>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <User size={16} className="inline mr-1" />
                  {t("students.modal.fullName", "الاسم الكامل")} *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormData({ ...formData, full_name: e.target.value });
                    if (errors.full_name) setErrors({ ...errors, full_name: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.full_name ? "border-red focus:border-red" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                  placeholder={t("students.modal.fullNamePlaceholder", "محمد أحمد")}
                />
                {errors.full_name && <p className="text-red text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Calendar size={16} className="inline mr-1" />
                  {t("students.modal.dob", "تاريخ الميلاد")} *
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => {
                    setFormData({ ...formData, dob: e.target.value });
                    if (errors.dob) setErrors({ ...errors, dob: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.dob ? "border-red focus:border-red" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                />
                {errors.dob && <p className="text-red text-sm mt-1">{errors.dob}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.modal.nationalId", "رقم التعريف الوطني")}
                </label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 ${isRTL ? "text-right" : "text-left"}`}
                  placeholder="123456789"
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 mb-4">
                {t("students.modal.contactInfo", "معلومات الاتصال")}
              </h3>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Mail size={16} className="inline mr-1" />
                  {t("students.modal.email", "البريد الإلكتروني")}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.email ? "border-red focus:border-red" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                  placeholder="student@example.com"
                />
                {errors.email && <p className="text-red text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Phone size={16} className="inline mr-1" />
                  {t("students.modal.phone", "رقم الهاتف")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.phone ? "border-red focus:border-red" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                  placeholder="0123456789"
                />
                {errors.phone && <p className="text-red text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Account Setup */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 mb-4">
                {t("students.modal.accountSetup", "إعداد الحساب")}
              </h3>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.modal.studentCode", "رمز الطالب")} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.student_code}
                    onChange={(e) => {
                      setFormData({ ...formData, student_code: e.target.value });
                      if (errors.student_code) setErrors({ ...errors, student_code: '' });
                    }}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                      errors.student_code ? "border-red focus:border-red" : "border-gray-300"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  />
                  <button
                    onClick={generateStudentCode}
                    type="button"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    {t("students.modal.generate", "توليد")}
                  </button>
                </div>
                {errors.student_code && <p className="text-red text-sm mt-1">{errors.student_code}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Lock size={16} className="inline mr-1" />
                  {t("students.modal.password", "كلمة المرور")} *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.password ? "border-red focus:border-red" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Lock size={16} className="inline mr-1" />
                  {t("students.modal.confirmPassword", "تأكيد كلمة المرور")} *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.confirmPassword ? "border-red focus:border-red" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 mb-4">
                {t("students.modal.summary", "ملخص")}
              </h3>
              <div className={`bg-gray-50 p-4 rounded-lg space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span className="font-medium">{t("students.modal.fullName", "الاسم الكامل")}:</span>
                  <span className="ml-2">{formData.full_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span className="font-medium">{t("students.modal.dateOfBirth", "تاريخ الميلاد")}:</span>
                  <span className="ml-2">{formData.dob}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <span className="font-medium">{t("students.modal.phone", "الهاتف")}:</span>
                  <span className="ml-2">{formData.phone}</span>
                </div>
                <div className="flex items-center">
                  <CreditCard size={16} className="mr-2" />
                  <span className="font-medium">{t("students.modal.studentCode", "رمز الطالب")}:</span>
                  <span className="ml-2">{formData.student_code}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Assign to Groups */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 mb-4">
                <Users size={20} className="inline mr-1" />
                {t("students.modal.assignGroups", "تعيين إلى مجموعات")}
              </h3>
              <p className="text-sm text-grey mb-4">
                {t("students.modal.assignGroupsHint", "اختر المجموعات التي سينضم إليها الطالب (اختياري)")}
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {rooms.map((room) => (
                  <label
                    key={room.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedRooms.includes(room.id)}
                      onChange={() => toggleRoom(room.id)}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-primary-800">{room.name}</p>
                      <p className="text-sm text-grey">{room.description || `ID: ${room.id}`}</p>
                    </div>
                  </label>
                ))}
                {rooms.length === 0 && (
                  <p className="text-center text-grey py-4">
                    {t("students.modal.noGroups", "لا توجد مجموعات متاحة")}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-800">
                  {formData.selectedRooms.length > 0
                    ? t("students.modal.selectedGroups", "تم اختيار {{count}} مجموعة", { count: formData.selectedRooms.length })
                    : t("students.modal.noGroupsSelected", "لم يتم اختيار أي مجموعة")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t border-gray-200 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="px-4 py-2 text-grey hover:text-primary-800 transition-colors"
            disabled={loading}
          >
            {currentStep === 1 ? t("common.cancel", "إلغاء") : t("students.modal.back", "رجوع")}
          </button>

          <button
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("common.loading", "جاري التحميل...")
              : currentStep === 4
              ? t("students.modal.create", "إنشاء الطالب")
              : t("students.modal.next", "التالي")}
          </button>
        </div>
      </div>
    </div>
  );
}
