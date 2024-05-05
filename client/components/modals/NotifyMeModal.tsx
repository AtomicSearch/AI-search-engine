import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import PhoneInput, { getCountryCallingCode } from "react-phone-number-input";
import "country-flag-icons/3x2/flags.css";
import "react-phone-number-input/style.css";
import { AppInfo } from "../../constants/appInfo.constant";

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
  position: relative;
  a:hover {
    text-decoration: none !important;
  }

  @media (max-width: 600px) {
    max-width: 90%;
  }
`;

const ModalTitle = styled.h3`
  margin-bottom: 10px;
`;

const ModalText = styled.p`
  margin-bottom: 20px;
`;

const PhoneInputWrapper = styled.div`
  margin-bottom: 20px;

  .PhoneInputCountryIcon {
    width: 2rem;
    height: 1.5rem;
  }

  .PhoneInputCountryIcon--border {
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.5),
      inset 0 0 0 1px rgba(0, 0, 0, 0.5);
  }

  .PhoneInputCountryIconImg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

const SubmitButton = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
`;

const CloseButton = styled.a`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer !important;
`;

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  onSubmitError: () => void;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  onSubmitError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("entry.PHONE_NUMBER_FIELD_ID", phoneNumber);

      const response = await fetch(AppInfo.GOOGLE_FORM_WAITING_LIST_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          "We couldn't submit your phone number. Please try again.",
        );
      }

      onSubmitSuccess();
      setPhoneNumber(""); // clear phone number after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      onSubmitError();
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal>
      <ModalContent ref={modalRef}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <ModalTitle>Get Notified When Smart Plan is Available</ModalTitle>
        <ModalText>
          The Smart plan isn't available yet. Enter your phone number below, and
          we'll notify you as soon as it's ready. Be among the first to
          experience the power of advanced AI with early bird advantages!
        </ModalText>
        <PhoneInputWrapper>
          <PhoneInput
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(value: string) => setPhoneNumber(value)}
            defaultCountry={AppInfo.DEFAULT_COUNTRY_CODE}
            countryIconComponent={({ country }: { country: string }) => (
              <div className="PhoneInputCountryIcon PhoneInputCountryIcon--border">
                <img
                  className="PhoneInputCountryIconImg"
                  src={`/flags/3x2/${country.toLowerCase()}.svg`}
                  alt={`${country} flag`}
                />
              </div>
            )}
          />
        </PhoneInputWrapper>
        <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
      </ModalContent>
    </Modal>
  );
};
