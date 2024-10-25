import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import PhoneInput, {
  type Value,
  Country,
  getCountryCallingCode,
  getCountries,
} from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import "react-phone-number-input/style.css";
import { I18n } from "../../../config/appInfo.config";
import { Server } from "../../modules/persistence";

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
  const [phoneNumber, setPhoneNumber] = useState("" as Value);
  const [countryCode, setCountryCode] = useState<Country>(
    I18n.DEFAULT_COUNTRY_CODE,
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const detectCountryCode = () => {
      const navigatorLanguage =
        navigator.languages?.[0] || navigator.language || "";
      const detectedCountryCode = navigatorLanguage.split("-")?.[1] || "";
      setCountryCode(detectedCountryCode as Country);
    };

    detectCountryCode();
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await Server.persistPhoneNumber(phoneNumber);
      if (!response.ok) {
        throw new Error(
          "We couldn't submit your phone number. Please try again.",
        );
      }
      // clear phone number after successful submission
      setPhoneNumber("" as Value);

      onSubmitSuccess();
    } catch (error: unknown) {
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

  const labels =
    I18n.DEFAULT_LANGUAGE_CODE === I18n.DEFAULT_LANGUAGE_CODE ? en : {};

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
            onChange={(value: Value) => setPhoneNumber(value)}
            defaultCountry={countryCode || I18n.DEFAULT_COUNTRY_CODE}
            labels={labels}
            countrySelectComponent={({ value, onChange, labels, ...rest }) => (
              <select
                {...rest}
                value={value}
                onChange={(event) => onChange(event.target.value || undefined)}
              >
                <option value="">{labels?.ZZ || "Unknown"}</option>
                {getCountries().map((country) => (
                  <option key={country} value={country}>
                    {labels?.[country] || country} +
                    {getCountryCallingCode(country)}
                  </option>
                ))}
              </select>
            )}
          />
        </PhoneInputWrapper>
        <SubmitButton onClick={handleSubmit}>Send</SubmitButton>
      </ModalContent>
    </Modal>
  );
};
