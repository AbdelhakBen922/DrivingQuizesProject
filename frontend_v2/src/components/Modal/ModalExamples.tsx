import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Modal";

/**
 * Example component showing different modal usage patterns
 * This demonstrates the flexibility of the modal system
 */
export default function ModalExamples() {
  const { t } = useTranslation();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Modal Examples</h1>

      <div className="flex gap-3">
        <button className="btn-primary" onClick={() => setIsSuccessOpen(true)}>
          Success Modal
        </button>
        <button className="btn-primary" onClick={() => setIsErrorOpen(true)}>
          Error Modal
        </button>
        <button className="btn-primary" onClick={() => setIsWarningOpen(true)}>
          Warning Modal
        </button>
        <button className="btn-primary" onClick={() => setIsCustomOpen(true)}>
          Custom Modal
        </button>
      </div>

      {/* Success Validation Modal */}
      <Modal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        size="sm"
      >
        <ModalHeader
          title="عملية ناجحة!"
          subtitle="تمت العملية بنجاح"
          type="success"
          centered
          icon={
            <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <ModalFooter className="justify-center">
          <button className="bg-green text-white px-8 py-3 rounded-xl font-semibold" onClick={() => setIsSuccessOpen(false)}>
            {t('common.ok')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Error Validation Modal */}
      <Modal
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
        size="sm"
      >
        <ModalHeader
          title="هل أنت متأكد؟"
          subtitle="لا يمكن التراجع عن هذا الإجراء"
          type="error"
          centered
          icon={
            <svg className="w-8 h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <ModalFooter className="justify-center">
          <button className="btn-secondary" onClick={() => setIsErrorOpen(false)}>
            {t('common.cancel')}
          </button>
          <button className="bg-red text-white px-6 py-3 rounded-xl font-semibold" onClick={() => setIsErrorOpen(false)}>
            {t('common.delete')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        size="md"
      >
        <ModalHeader
          title="تحذير"
          subtitle="يرجى التحقق من البيانات قبل المتابعة"
          type="warning"
          onClose={() => setIsWarningOpen(false)}
        />
        <ModalBody>
          <p className="text-grey">
            بعض الحقول فارغة أو تحتوي على أخطاء. يرجى المراجعة والمحاولة مرة أخرى.
          </p>
        </ModalBody>
        <ModalFooter>
          <button className="btn-secondary" onClick={() => setIsWarningOpen(false)}>
            {t('common.cancel')}
          </button>
          <button className="bg-yellow text-white px-6 py-3 rounded-xl font-semibold" onClick={() => setIsWarningOpen(false)}>
            فهمت
          </button>
        </ModalFooter>
      </Modal>

      {/* Custom Fully Flexible Modal */}
      <Modal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        size="lg"
      >
        {/* Completely custom content - no ModalHeader */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-800">محتوى مخصص بالكامل</h2>
            <button onClick={() => setIsCustomOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-primary-800">يمكنك وضع أي محتوى تريده هنا!</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green/10 p-4 rounded-lg text-center">
                <p className="font-bold text-green">نجاح</p>
              </div>
              <div className="bg-red/10 p-4 rounded-lg text-center">
                <p className="font-bold text-red">خطأ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom footer */}
        <div className="flex justify-between p-6 bg-gray-50 border-t">
          <button className="btn-secondary" onClick={() => setIsCustomOpen(false)}>
            إلغاء
          </button>
          <div className="flex gap-2">
            <button className="bg-primary-300 text-white px-4 py-2 rounded-xl">حفظ كمسودة</button>
            <button className="bg-green text-white px-4 py-2 rounded-xl">نشر</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
