import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import confetti from "canvas-confetti";
import { FaMicrophone } from "react-icons/fa";
import styled from "styled-components";
import toast from "react-hot-toast";
import { getRandomQuerySuggestion } from "../modules/querySuggestions";

import { debounce } from "../utils/debounce";
import { LocalStorageKeys } from "../constants/localStorages.constant";
import { confettiOptions } from "../constants/confettiOptions.constant";
import { Header } from "./Header";
import { I18n } from "../constants/appInfo.constant";

interface SearchFormProps {
  query: string;
  updateQuery: (query: string) => void;
  clearResponses: () => void;
}

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  background-color: #ffffff;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const MicrophoneButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  transition: color 0.3s ease;

  &:hover {
    color: #007bff;
  }

  &:active {
    transform: translateY(-40%); /* Decrease movement on click */
  }
`;

export function SearchForm({
  query,
  updateQuery,
  clearResponses,
}: SearchFormProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const windowInnerHeight = useWindowInnerHeight();
  const [suggestedQuery, setSuggestedQuery] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [notificationShown, setNotificationShown] = useState<boolean>(false);

  useEffect(() => {
    getRandomQuerySuggestion().then((querySuggestion) => {
      setSuggestedQuery(querySuggestion);
    });
  }, []);

  const navigate = useNavigate();

  const startSearching = useCallback(
    (queryToEncode: string) => {
      updateQuery(queryToEncode);
      navigate(`/?q=${encodeURIComponent(queryToEncode)}`);
    },
    [updateQuery, navigate],
  );

  const clearSearchResults = () => {
    startSearching("");
    clearResponses();
  };

  const navigateToHomePage = () => {
    navigate("/");

    if (textAreaRef.current) {
      textAreaRef.current.value = "";
      clearSearchResults();
    }
  };

  const debouncedStartSearching = debounce(startSearching, 500);

  const showUpgradeNotification = () => {
    setNotificationShown(true); // Prevent showing the modal multiple times

    toast.custom(
      <div
        style={{
          background: "#fff",
          color: "#333",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p style={{ marginBottom: "8px" }}>
          Upgrade your subscription for longer queries?
        </p>
        <button
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            window.location.href = "/pricing";
          }}
        >
          Upgrade Now 🚀
        </button>
      </div>,
      {
        duration: 5000,
        position: "top-center",
        style: {
          background: "transparent",
          boxShadow: "none",
        },
      },
    );
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const userQuery = event.target.value.trim();
    const wordCount = userQuery.split(/\s+/).length;
    const needToUpgradeSubscription = wordCount > 10;
    if (needToUpgradeSubscription && !notificationShown) {
      showUpgradeNotification();
      return;
    }

    const userQueryIsBlank = userQuery.length === 0;
    const suggestedQueryIsBlank = suggestedQuery.length === 0;

    if (userQueryIsBlank && suggestedQueryIsBlank) {
      setSuggestedQuery(await getRandomQuerySuggestion());
    } else if (!userQueryIsBlank && !suggestedQueryIsBlank) {
      setSuggestedQuery("");
    }

    // Start searching immediately when user types (with a debounce)
    if (!userQueryIsBlank) {
      debouncedStartSearching(userQuery);
    } else {
      // If the user deleted the input, reset the search results
      clearSearchResults();
    }
  };

  const handleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = I18n.DEFAULT_LANGUAGE_COUNTRY_CODE;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (textAreaRef.current) {
          textAreaRef.current.value = transcript;
          startSearching(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    const isFirstVisit = localStorage.getItem(LocalStorageKeys.FIRST_VISIT);
    if (!isFirstVisit) {
      const updatedConfettiOptions = {
        ...confettiOptions,
        spread: 70,
        disableForReducedMotion: true,
      };
      confetti(updatedConfettiOptions);
      localStorage.setItem(LocalStorageKeys.FIRST_VISIT, "true");
    }
  }, []);

  useEffect(() => {
    const keyboardEventHandler = (event: KeyboardEvent) => {
      if (event.code === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (textAreaRef.current) {
          const userQuery = textAreaRef.current.value.trim();
          if (userQuery.length > 0) {
            startSearching(userQuery);
          }
        }
      }
      if (event.code === "Escape") {
        if (textAreaRef.current) {
          textAreaRef.current.value = "";
          clearSearchResults(); // Reset results if press Esc
        }
      }
    };

    const textArea = textAreaRef.current;
    textArea?.addEventListener("keypress", keyboardEventHandler);

    return () => {
      textArea?.removeEventListener("keypress", keyboardEventHandler);
    };
  }, [startSearching]);

  return (
    <>
      <Header goTo={navigateToHomePage} />
      <div
        style={
          query.length === 0
            ? {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: windowInnerHeight * 0.8,
              }
            : undefined
        }
      >
        <form style={{ width: "100%" }}>
          <SearchContainer>
            <TextAreaWrapper>
              <TextareaAutosize
                defaultValue={query}
                placeholder={suggestedQuery}
                ref={textAreaRef}
                onChange={handleInputChange}
                autoFocus
                minRows={1}
                maxRows={6}
                style={{
                  width: "100%",
                  border: "1px solid #ccc",
                  resize: "none",
                  backgroundColor: "transparent",
                  fontSize: "18px",
                  color: "#333",
                  outline: "none",
                  paddingRight: "40px",
                  overflow: "hidden",
                }}
              />
              <MicrophoneButton type="button" onClick={handleVoiceInput}>
                <FaMicrophone color={isListening ? "red" : "#888"} size={20} />
              </MicrophoneButton>
            </TextAreaWrapper>
          </SearchContainer>
        </form>
      </div>
    </>
  );
}

function useWindowInnerHeight() {
  const [windowInnerHeight, setWindowInnerHeight] = useState<number>(
    self.innerHeight,
  );

  useEffect(() => {
    const handleResize = () => setWindowInnerHeight(self.innerHeight);
    self.addEventListener("resize", handleResize);
    return () => self.removeEventListener("resize", handleResize);
  }, []);

  return windowInnerHeight;
}
