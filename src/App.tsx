import {
  useState,
  useEffect
} from "react";
import type { ChangeEvent, FormEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

/* ---------- TYPES ---------- */
interface PlaceSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface PlaceData {
  name: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface FormData {
  name: string;
  dob: string;
  birthHour: string;
  birthMinute: string;
  ampm: "AM" | "PM";
  placeText: string;
  place?: PlaceData;
}

/* ---------- COMPONENT ---------- */
function App() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dob: "",
    birthHour: "",
    birthMinute: "",
    ampm: "AM",
    placeText: "",
  });

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingPlace, setLoadingPlace] = useState(false);

  /* ---------- HANDLERS ---------- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- AUTOCOMPLETE ---------- */
  useEffect(() => {
    if (formData.placeText.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchPlaces = async () => {
      setLoadingPlace(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${formData.placeText}&format=json&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
      setLoadingPlace(false);
    };

    const debounce = setTimeout(fetchPlaces, 400);
    return () => clearTimeout(debounce);
  }, [formData.placeText]);

  /* ---------- SELECT PLACE ---------- */
  const selectPlace = async (place: PlaceSuggestion) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    // Fetch timezone
    const tzRes = await fetch(
      `https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=YOUR_GEONAMES_USERNAME`
    );
    const tzData = await tzRes.json();

    const placeObj: PlaceData = {
      name: place.display_name,
      lat,
      lon,
      timezone: tzData.timezoneId || "Unknown",
    };

    setFormData((prev) => ({
      ...prev,
      placeText: place.display_name,
      place: placeObj,
    }));

    setSuggestions([]);
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    console.log("🔮 Horoscope Input Object:", {
      ...formData,
    });

    alert("Birth data saved. Ready for horoscope calculation!");
  };

  /* ---------- UI ---------- */
  return (
    <div className="app-bg">
      <div className="right-panel">
        <div className="form-wrapper">
          <h2 className="form-title">✨ Birth Details ✨</h2>

          <form onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Full Name"
              className="form-control custom-input"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="dob"
              className="form-control custom-input"
              value={formData.dob}
              onChange={handleChange}
              required
            />

            {/* Time */}
            <div className="time-row">
              <input
                type="number"
                name="birthHour"
                placeholder="HH"
                min="1"
                max="12"
                className="form-control custom-input"
                value={formData.birthHour}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="birthMinute"
                placeholder="MM"
                min="0"
                max="59"
                className="form-control custom-input"
                value={formData.birthMinute}
                onChange={handleChange}
                required
              />
              <select
                name="ampm"
                className="form-control custom-input"
                value={formData.ampm}
                onChange={handleChange}
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>

            {/* Place */}
            <div className="position-relative">
              <input
                name="placeText"
                placeholder="Place of Birth (City, Country)"
                className="form-control custom-input"
                value={formData.placeText}
                onChange={handleChange}
                autoComplete="off"
                required
              />

              {loadingPlace && (
                <div className="suggestions">Searching...</div>
              )}

              {suggestions.length > 0 && (
                <div className="suggestions">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="suggestion-item"
                      onClick={() => selectPlace(s)}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn submit-btn mt-4">
              🔮 Generate Horoscope
            </button>
          </form>

          {/* DEBUG / CONFIRMATION */}
          {/* {formData.place && (
            <div className="mt-3 text-light small">
              <p>📍 Lat: {formData.place.lat}</p>
              <p>📍 Lon: {formData.place.lon}</p>
              <p>🕰️ Timezone: {formData.place.timezone}</p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default App;
