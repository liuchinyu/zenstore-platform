import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FormModalProps {
  title: string;
  message: string;
  email: string;
  verificationToken: string;
  userName: string;
  onClose?: () => void; // 添加一個可選的回調函數
}

export default function FormModal({
  title,
  message,
  email,
  verificationToken,
  userName,
  onClose,
}: FormModalProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (message) {
      setIsModalOpen(true);
    }
  }, [message]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onClose) {
      onClose();
    }
    router.push(
      `/auth/register/verification?email=${email}&verificationToken=${verificationToken}&userName=${userName}`
    );
  };

  return (
    <>
      {/* <!-- Modal --> */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className={`modal fade ${isModalOpen ? "show d-block" : ""}`}
            id="exampleModal"
            tabIndex={-1}
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog ">
              <div className="modal-content shadow">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">
                    {title}
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    // data-bs-dismiss="modal"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">{message}</div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
