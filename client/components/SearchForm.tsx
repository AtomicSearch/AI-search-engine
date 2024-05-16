import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import confetti from "canvas-confetti";
import { FaMicrophone } from "react-icons/fa";
import styled from "styled-components";
import toast, { Toast } from "react-hot-toast";

import { getRandomQuerySuggestion } from "../modules/querySuggestions";
import { debounce } from "../../utils/debounce";
import { LocalStorageKeys } from "../constants/localStorages.constant";
import { confettiOptions } from "../../config/confettiOptions.config";
import { Header } from "./Header";
import { I18n, Search, SubscriptionPlan } from "../../config/appInfo.config";
import { Tagline } from "./atoms/Tagline.atom";
import { Millisecond } from "../constants/time.constant";
import { ToastModal } from "./atoms/ToastModel.atom";
import { BlueButton } from "./atoms/Button.atom";
import { messages } from "../modules/en.messages.constants";
import { useWindowInnerHeight } from "../hooks/useWindowInnerHeight";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { useQueryCount } from "../hooks/useQueryCount";
import { stripHtmlTags } from "../../utils/strip-tags";
import { Server } from "../modules/persistence";

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
  margin-bottom: 25px;
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
  const { queryCount, incrementQueryCount, isQueryLimitReached } =
    useQueryCount();
  const queryLimitNotificationRef = useRef<Toast | null>(null);
  const queryWordLimitNotificationRef = useRef<Toast | null>(null);

  const isUserSubscribed = useSubscriptionStatus();

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

  const clearSearchResultsAndUrl = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = "";
      startSearching("");
      clearResponses();
    }

    // Reset the URL to index
    navigate("/");
  }, [startSearching, clearResponses, navigate]);

  const navigateToHomePage = useCallback(() => {
    clearSearchResultsAndUrl();
  }, [clearSearchResultsAndUrl]);

  const debouncedStartSearching = useCallback(debounce(startSearching, 300), [
    startSearching,
  ]);

  const showQueryLimitNotification = useCallback(() => {
    if (queryWordLimitNotificationRef.current) {
      toast.dismiss(queryWordLimitNotificationRef.current);
      queryWordLimitNotificationRef.current = null;
    }

    if (!queryLimitNotificationRef.current) {
      queryLimitNotificationRef.current = toast.custom(
        <ToastModal>
          <p style={{ marginBottom: "8px" }}>
            Queries to latest AI models are quite costly. You can either come
            back in 1 hour or subscribe to the unlimited search.
          </p>
          <p>
            Enter your phone number if you wish us to notify you when you can
            search again for free.
          </p>
          <input
            type="tel"
            placeholder="Enter your phone number"
            onChange={(e) =>
              localStorage.setItem(
                localStorage.TEMPORARY_USER_PHONE_NUMBER,
                e.target.value,
              )
            }
            required
            style={{ marginBottom: "8px", textAlign: "center" }}
          />
          <BlueButton
            onClick={async () => {
              toast.dismiss(queryLimitNotificationRef.current!);
              queryLimitNotificationRef.current = null;

              try {
                const temporarySavedPhoneNumber = localStorage.getItem(
                  localStorage.TEMPORARY_USER_PHONE_NUMBER,
                );
                if (temporarySavedPhoneNumber) {
                  const response = await Server.persistPhoneNumber(
                    temporarySavedPhoneNumber,
                  );
                  if (response.ok) {
                    return toast.success("Number successfully registered", {
                      position: "top-center",
                      duration: Millisecond.THREE_SECOND,
                    });
                  }
                }
                throw new Error("Something happened. Please try again.");
              } catch (e) {
                toast.error("Something went wrong. Please try again later.", {
                  position: "top-right",
                  duration: Millisecond.THREE_SECOND,
                });
              }
            }}
          >
            {messages.levelUp}
          </BlueButton>
        </ToastModal>,
        {
          duration: Infinity,
          position: "top-center",
          style: {
            background: "transparent",
            boxShadow: "none",
          },
          onClick: () => {
            toast.dismiss(queryLimitNotificationRef.current!);
            queryLimitNotificationRef.current = null;
          },
        },
      );
    }
  }, []);

  const showQueryWordLimitNotification = useCallback(() => {
    if (queryLimitNotificationRef.current) {
      toast.dismiss(queryLimitNotificationRef.current);
      queryLimitNotificationRef.current = null;
    }

    if (!queryWordLimitNotificationRef.current) {
      queryWordLimitNotificationRef.current = toast.custom(
        <ToastModal>
          <p style={{ marginBottom: "8px" }}>
            Upgrade your subscription for leveling up queries.
          </p>
          <BlueButton
            onClick={() => {
              toast.dismiss(queryWordLimitNotificationRef.current!);
              queryWordLimitNotificationRef.current = null;
              window.location.href = SubscriptionPlan.PRICING_PAGE_URL;
            }}
          >
            Level Up Now 🚀
          </BlueButton>
        </ToastModal>,
        {
          duration: Millisecond.FIVE_SECOND,
          position: "top-center",
          style: {
            background: "transparent",
            boxShadow: "none",
          },
          onClick: () => {
            toast.dismiss(queryWordLimitNotificationRef.current!);
            queryWordLimitNotificationRef.current = null;
          },
        },
      );
    }
  }, []);

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const userQuery = event.target.value.trim();

      const wordCount = userQuery.split(/\s+/).length;
      const needToUpgradeSubscription =
        !isUserSubscribed && wordCount > Search.MAXIMUM_FREE_QUERY_WORDS;

      if (needToUpgradeSubscription) {
        showQueryWordLimitNotification();
        return;
      }

      if (isQueryLimitReached) {
        showQueryLimitNotification();
        return;
      }

      const userQueryIsBlank = userQuery.length === 0;
      const suggestedQueryIsBlank = suggestedQuery?.length === 0;

      // Start searching immediately when user types (with a debounce)
      if (!userQueryIsBlank) {
        document.title = stripHtmlTags(userQuery);
        debouncedStartSearching(userQuery);
        incrementQueryCount();
      } else {
        // If the user deleted the input, reset the search results
        clearSearchResultsAndUrl();
      }

      if (userQueryIsBlank && suggestedQueryIsBlank) {
        setSuggestedQuery(await getRandomQuerySuggestion());
      } else if (!userQueryIsBlank && !suggestedQueryIsBlank) {
        // Clear the suggested queries
        setSuggestedQuery("");
      }
    },
    [
      isQueryLimitReached,
      showQueryLimitNotification,
      showQueryWordLimitNotification,
      suggestedQuery,
      debouncedStartSearching,
      incrementQueryCount,
      clearSearchResultsAndUrl,
    ],
  );

  const handleVoiceInput = useCallback(() => {
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
  }, [isListening, startSearching]);

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
      const isEnterKeyPressed = event.code === "Enter";
      const isEscapeKeyPressed = event.code === "Escape";

      if (isEnterKeyPressed && !event.shiftKey) {
        event.preventDefault();
        if (textAreaRef.current) {
          const userQuery = textAreaRef.current.value.trim();
          if (userQuery.length > 0) {
            startSearching(userQuery);
          }
        }
      }

      if (isEscapeKeyPressed) {
        // Reset results if press Esc
        clearSearchResultsAndUrl();
      }
    };

    const textArea = textAreaRef.current;
    textArea?.addEventListener("keypress", keyboardEventHandler);

    return () => {
      textArea?.removeEventListener("keypress", keyboardEventHandler);
    };
  }, [startSearching, clearSearchResultsAndUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        queryLimitNotificationRef.current &&
        queryLimitNotificationRef.current.props &&
        queryLimitNotificationRef.current.props.children &&
        !queryLimitNotificationRef.current.props.children.props.children.some(
          (child: React.ReactNode) =>
            child instanceof Node && child.contains(event.target as Node),
        )
      ) {
        toast.dismiss(queryLimitNotificationRef.current);
        queryLimitNotificationRef.current = null;
      }

      if (
        queryWordLimitNotificationRef.current &&
        queryWordLimitNotificationRef.current.props &&
        queryWordLimitNotificationRef.current.props.children &&
        !queryWordLimitNotificationRef.current.props.children.props.children.some(
          (child: React.ReactNode) =>
            child instanceof Node && child.contains(event.target as Node),
        )
      ) {
        toast.dismiss(queryWordLimitNotificationRef.current);
        queryWordLimitNotificationRef.current = null;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isQueryEmpty = query.length === 0;

  return (
    <>
      <Header goTo={navigateToHomePage} />
      {isQueryEmpty && <Tagline />}

      <div
        style={
          isQueryEmpty
            ? {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: windowInnerHeight * 0.3,
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
