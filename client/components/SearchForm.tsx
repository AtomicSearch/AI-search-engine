import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { getRandomQuerySuggestion } from "../modules/querySuggestions";
import { debounce } from "../utils/debounce";
import Confetti from "react-confetti";

interface SearchFormProps {
  query: string;
  updateQuery: (query: string) => void;
}

export function SearchForm({ query, updateQuery }: SearchFormProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const confettiRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const windowInnerHeight = useWindowInnerHeight();
  const [suggestedQuery, setSuggestedQuery] = useState<string>(
    getRandomQuerySuggestion(),
  );

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

  useEffect(() => {
    const visited = localStorage.getItem("firstVisit");
    if (!visited) {
      setShowConfetti(true);
      localStorage.setItem("firstVisit", "true");
    }
  }, []);

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
        <div ref={confettiRef} style={{ position: "relative" }}>
          {showConfetti && confettiRef.current && (
            <Confetti
              numberOfPieces={200}
              recycle={false}
              width={confettiRef.current.offsetWidth}
              height={confettiRef.current.offsetHeight}
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          )}
          <TextareaAutosize
            defaultValue={query}
            placeholder={suggestedQuery}
            ref={textAreaRef}
            onChange={handleInputChange}
            autoFocus
            minRows={1}
            maxRows={6}
          />
        </div>
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
