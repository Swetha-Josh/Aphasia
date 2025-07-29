import React, { useState } from "react";

function App() {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [showPainScale, setShowPainScale] = useState(false);
  const [showSpeechFeedback, setShowSpeechFeedback] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState({
    icon: "",
    text: "",
    emergency: false,
  });

  const aiSuggestions = [
    { text: "I need help with...", icon: "🖐️" },
    { text: "Can you repeat that?", icon: "🔁" },
    { text: "I'm feeling better", icon: "😊" },
    { text: "Thank you", icon: "❤️" },
  ];

  const speakText = (text) => {
    if (audioEnabled && "speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.volume = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang =
        selectedLanguage === "EN"
          ? "en-US"
          : selectedLanguage === "ES"
          ? "es-ES"
          : "fr-FR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsListening(true);

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        handleButtonPress("🎙️", speechResult, false);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const handleButtonPress = (icon, text, emergency = false) => {
    setCurrentSpeech({ icon, text, emergency });
    setShowSpeechFeedback(true);
    speakText(text);
    if (showAiSuggestions) setShowAiSuggestions(false);
  };

  const CategoryButton = ({ icon, text, emergency = false }) => (
    <button
      onClick={() => handleButtonPress(icon, text, emergency)}
      className={`flex flex-col items-center justify-center px-4 py-6 rounded-xl border-2 shadow-md text-center transition-all duration-200 min-h-[100px] ${
        emergency
          ? "bg-red-600 text-white border-red-700"
          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <span className="text-sm font-semibold">{text}</span>
    </button>
  );

  const QuickAccessButton = ({ icon, text, emergency = false, onClick }) => (
    <button
      onClick={
        onClick || (() => handleButtonPress(icon, text, emergency ?? false))
      }
      className={`flex-1 mx-1 p-3 rounded-lg flex flex-col items-center text-sm font-semibold min-h-[60px] transition ${
        emergency ? "bg-red-600 text-white" : "bg-blue-600 text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {text}
    </button>
  );

  const VoiceInputButton = () => (
    <button
      onClick={handleVoiceInput}
      disabled={isListening}
      className={`flex-1 mx-1 p-3 rounded-lg flex flex-col items-center text-sm font-semibold min-h-[60px] transition ${
        isListening ? "bg-green-700 animate-pulse" : "bg-green-600 hover:bg-green-700"
      } text-white`}
    >
      🎙️
      {isListening ? "Listening..." : "Voice"}
    </button>
  );

  const AiSuggestionBubble = ({ suggestion }) => (
    <button
      onClick={() => handleButtonPress(suggestion.icon, suggestion.text)}
      className="inline-flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-full border border-blue-300 transition mr-2 mb-2"
    >
      <span>{suggestion.icon}</span>
      <span>{suggestion.text}</span>
    </button>
  );

  const SpeechFeedbackModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <div
          className={`flex flex-col items-center p-4 rounded ${
            currentSpeech.emergency
              ? "bg-red-100 border-red-300"
              : "bg-blue-100 border-blue-300"
          } border`}
        >
          <div className="text-5xl mb-2">{currentSpeech.icon}</div>
          <div
            className={`text-xl font-bold text-center ${
              currentSpeech.emergency ? "text-red-800" : "text-blue-800"
            }`}
          >
            {currentSpeech.text}
          </div>
        </div>
        <button
          onClick={() => speakText(currentSpeech.text)}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          🔊 Play Audio
        </button>
        <button
          onClick={() => {
            setShowSpeechFeedback(false);
            speechSynthesis.cancel();
            setIsSpeaking(false);
          }}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );

  const PainScaleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 rounded-lg w-full max-w-sm">
        <h3 className="text-center text-lg font-semibold mb-4">Pain Level</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[...Array(10).keys()].map((i) => {
            const num = i + 1;
            let color =
              num <= 3
                ? "bg-green-100 border-green-300 text-green-800"
                : num <= 6
                ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                : "bg-red-100 border-red-300 text-red-800";
            return (
              <button
                key={num}
                onClick={() => {
                  handleButtonPress("⚠️", `Pain level ${num}`, num >= 7);
                  setShowPainScale(false);
                }}
                className={`aspect-square rounded-lg border-2 font-bold ${color}`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowPainScale(false)}
          className="w-full bg-gray-200 py-2 rounded font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-white shadow px-4 py-3 flex justify-between items-center">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="EN">EN</option>
          <option value="ES">ES</option>
          <option value="FR">FR</option>
        </select>
        <h1 className="text-lg font-bold">TapToTalk</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-2 py-1 rounded ${
              audioEnabled
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {audioEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8 pb-28">
        {/* AI Suggestions */}
        {showAiSuggestions && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-800">
                Suggested Phrases
              </span>
              <button
                onClick={() => setShowAiSuggestions(false)}
                className="text-blue-700 text-sm"
              >
                ✖️
              </button>
            </div>
            <div className="flex flex-wrap">
              {aiSuggestions.map((s, i) => (
                <AiSuggestionBubble key={i} suggestion={s} />
              ))}
            </div>
          </div>
        )}

        {!showAiSuggestions && (
          <button
            onClick={() => setShowAiSuggestions(true)}
            className="w-full bg-blue-100 text-blue-700 border border-blue-300 py-2 rounded text-sm"
          >
            💡 Show AI Suggestions
          </button>
        )}

        {/* Categories */}
        {[
          ["Personal Needs", ["🚻 Toilet", "🍽️ Food", "💧 Water", "🆘 Help"]],
          ["Emotions", ["😊 Happy", "😴 Tired", "⚠️ Pain", "❓ Confused"]],
          ["People", ["👨‍⚕️ Doctor", "🏠 Family", "👩‍⚕️ Caregiver", "➕ Add Person"]],
          ["Medical Needs", ["💊 Medication", "🛌 Rest", "👩‍⚕️ Need Nurse", "🚑 Emergency"]],
          ["Basic Commands", ["⏹️ Stop", "✅ Yes", "❌ No", "🔁 Repeat"]],
        ].map(([title, items], idx) => (
          <div key={idx}>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((entry) => {
                const [icon, ...textParts] = entry.split(" ");
                const text = textParts.join(" ");
                return (
                  <CategoryButton
                    key={text}
                    icon={icon}
                    text={text}
                    emergency={text === "Emergency"}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-3 flex space-x-2 shadow-md">
        <QuickAccessButton icon="🚑" text="Emergency" emergency />
        <QuickAccessButton icon="✅" text="Yes" />
        <QuickAccessButton icon="❌" text="No" />
        <QuickAccessButton icon="⚠️" text="Pain 1–10" onClick={() => setShowPainScale(true)} />
        <VoiceInputButton />
      </div>

      {showSpeechFeedback && <SpeechFeedbackModal />}
      {showPainScale && <PainScaleModal />}
    </div>
  );
}

export default App;