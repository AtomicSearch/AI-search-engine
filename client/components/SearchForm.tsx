import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import confetti from "canvas-confetti";
import { FaMicrophone } from "react-icons/fa";
import styled from "styled-components";

import { getRandomQuerySuggestion } from "../modules/querySuggestions";
import { debounce } from "../utils/debounce";
import { LocalStorageKeys } from "../constants/localStorages.constant";
import { confettiOptions } from "../constants/confettiOptions.constant";

interface SearchFormProps {
  query: string;
  updateQuery: (query: string) => void;
}

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const TextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
`;

export const TextArea = styled(TextareaAutosize)`
  width: 100%;
  border: none;
  resize: none;
  background-color: transparent;
  font-size: 18px;
  color: #333;
  outline: none;
  padding-right: 40px;

  &::placeholder {
    color: #999;
  }
`;

export const MicrophoneButton = styled.button`
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
`;

export function SearchForm({ query, updateQuery }: SearchFormProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const windowInnerHeight = useWindowInnerHeight();
  const [suggestedQuery, setSuggestedQuery] = useState<string>(
    getRandomQuerySuggestion(),
  );
  const [isListening, setIsListening] = useState<boolean>(false);

  const navigate = useNavigate();

  const startSearching = useCallback(
    (queryToEncode: string) => {
      updateQuery(queryToEncode);
      navigate(`/?q=${encodeURIComponent(queryToEncode)}`);
    },
    [updateQuery, navigate],
  );

  const debouncedStartSearching = debounce(startSearching, 500);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userQuery = event.target.value.trim();
    const userQueryIsBlank = userQuery.length === 0;
    const suggestedQueryIsBlank = suggestedQuery.trim().length === 0;

    if (userQueryIsBlank && suggestedQueryIsBlank) {
      setSuggestedQuery(getRandomQuerySuggestion());
    } else if (!userQueryIsBlank && !suggestedQueryIsBlank) {
      setSuggestedQuery("");
    }

    // Start searching immediately when user types (with a debounce)
    if (!userQueryIsBlank) {
      debouncedStartSearching(userQuery);
    } else {
      // If the user deleted the input, reset the search results
      startSearching("");
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-US";
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
          startSearching(""); // Reset search results if press Esc
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
              style={{ paddingRight: "40px" }}
            />
            <MicrophoneButton type="button" onClick={handleVoiceInput}>
              <FaMicrophone color={isListening ? "red" : "black"} />
            </MicrophoneButton>
          </TextAreaWrapper>
        </SearchContainer>
      </form>
    </div>
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
