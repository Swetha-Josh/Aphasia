"use client";
import React from "react";

function MainComponent() {
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [selectedLanguage, setSelectedLanguage] = React.useState("EN");
  const [showPainScale, setShowPainScale] = React.useState(false);
  const [showSpeechFeedback, setShowSpeechFeedback] = React.useState(false);
  const [showVoiceInput, setShowVoiceInput] = React.useState(false);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = React.useState(true);
  const [showAiSuggestions, setShowAiSuggestions] = React.useState(false);
  const [currentSpeech, setCurrentSpeech] = React.useState({
    icon: "",
    text: "",
    emergency: false,
  });
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);

  const aiSuggestions = [
    { text: "I need help with...", icon: "fas fa-question-circle" },
    { text: "Can you repeat that?", icon: "fas fa-redo" },
    { text: "I'm feeling better", icon: "fas fa-smile" },
    { text: "Thank you", icon: "fas fa-heart" },
  ];

  const speakText = (text, showFeedback = true) => {
    if (audioEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang =
        selectedLanguage === "ES"
          ? "es-ES"
          : selectedLanguage === "FR"
          ? "fr-FR"
          : "en-US";
      utterance.rate = 0.8;
      utterance.volume = 0.9;

      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Speaking:", text);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      recognition.lang =
        selectedLanguage === "ES"
          ? "es-ES"
          : selectedLanguage === "FR"
          ? "fr-FR"
          : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleButtonPress("fas fa-microphone", `Voice: ${transcript}`, false);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        handleButtonPress("fas fa-microphone", "Voice input error", false);
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleButtonPress("fas fa-microphone", "Voice input received", false);
      }, 3000);
    }
  };

  const handleButtonPress = (icon, text, emergency = false, onClick = null) => {
    setCurrentSpeech({ icon, text, emergency });
    setShowSpeechFeedback(true);
    speakText(text);

    if (showAiSuggestions) {
      setShowAiSuggestions(false);
    }

    if (onClick) onClick();
  };

  return (
    <div>
      <h1>Voice Interaction UI</h1>
      <button onClick={handleVoiceInput}>
        {isListening ? "Listening..." : "Start Voice Input"}
      </button>

      {showSpeechFeedback && (
        <div>
          <i className={currentSpeech.icon}></i>
          <span>{currentSpeech.text}</span>
        </div>
      )}

      {aiSuggestionsEnabled && (
        <div>
          <button onClick={() => setShowAiSuggestions(!showAiSuggestions)}>
            Toggle AI Suggestions
          </button>

          {showAiSuggestions && (
            <ul>
              {aiSuggestions.map((sugg, index) => (
                <li key={index}>
                  <button onClick={() => handleButtonPress(sugg.icon, sugg.text)}>
                    <i className={sugg.icon}></i> {sugg.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default MainComponent;
