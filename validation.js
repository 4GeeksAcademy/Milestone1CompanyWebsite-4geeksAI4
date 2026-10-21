const form = document.querySelector("#brasa-points-form");

if (form) {
  const countrySelect = form.querySelector("#country");
  const citySelect = form.querySelector("#city");
  const locationSelect = form.querySelector("#favorite-location");
  const successMessage = document.querySelector("#success-message");
  const touchedFields = new Set();
  let submitted = false;
  const validationMessages = document.documentElement.lang === "es"
    ? {
        fullName: "Ingresa tu nombre completo (nombre y apellido)",
        email: "Ingresa un correo electrónico válido (ejemplo: nombre@correo.com)",
        phone: "El teléfono debe incluir el código del país (ejemplo: +57 300 123 4567 o +1 305 123 4567)",
        country: "Selecciona tu país",
        city: "Selecciona tu ciudad",
        favoriteLocation: "Elige una sede Brasaland de la ciudad seleccionada.",
        howFoundUs: "Cuéntanos cómo conociste Brasaland",
        dateOfBirth: "Debes tener 18 años o más para registrarte en Brasa Points",
        acceptTerms: "Debes aceptar los términos del programa Brasa Points para continuar"
      }
    : {
        fullName: "Enter your full name (first and last name)",
        email: "Enter a valid email (example: <name@email.com>)",
        phone: "Phone must include country code (example: +57 300 123 4567 or +1 305 123 4567)",
        country: "Select your country",
        city: "Select your city",
        favoriteLocation: "Choose a Brasaland location in the selected city.",
        howFoundUs: "Tell us how you found Brasaland",
        dateOfBirth: "You must be 18 or older to register for Brasa Points",
        acceptTerms: "You must accept the Brasa Points program terms to continue"
      };

  const citiesByCountry = {
    colombia: [
      ["Medellín", "medellin"],
      ["Bogotá", "bogota"],
      ["Cali", "cali"]
    ],
    "united-states": [
      ["Miami", "miami"],
      ["Orlando", "orlando"]
    ]
  };

  const locationsByCountryAndCity = {
    colombia: {
      medellin: [
        "Brasaland El Poblado",
        "Brasaland Laureles",
        "Brasaland Envigado",
        "Brasaland Sabaneta"
      ],
      bogota: [
        "Brasaland Usaquén",
        "Brasaland Chapinero",
        "Brasaland Zona Rosa"
      ],
      cali: [
        "Brasaland Granada",
        "Brasaland Ciudad Jardín",
        "Brasaland Unicentro"
      ]
    },
    "united-states": {
      miami: ["Brasaland Brickell", "Brasaland Coral Gables"],
      orlando: ["Brasaland Downtown", "Brasaland International Drive"]
    }
  };

  const fields = {
    fullName: {
      control: form.querySelector("#full-name"),
      error: form.querySelector('[data-error-for="fullName"]')
    },
    email: {
      control: form.querySelector("#email"),
      error: form.querySelector('[data-error-for="email"]')
    },
    phone: {
      control: form.querySelector("#phone"),
      error: form.querySelector('[data-error-for="phone"]')
    },
    country: {
      control: countrySelect,
      error: form.querySelector('[data-error-for="country"]')
    },
    city: {
      control: citySelect,
      error: form.querySelector('[data-error-for="city"]')
    },
    favoriteLocation: {
      control: locationSelect,
      error: form.querySelector('[data-error-for="favoriteLocation"]')
    },
    howFoundUs: {
      control: form.querySelector("#how-found-us"),
      error: form.querySelector('[data-error-for="howFoundUs"]')
    },
    dateOfBirth: {
      control: form.querySelector("#date-of-birth"),
      error: form.querySelector('[data-error-for="dateOfBirth"]')
    },
    acceptTerms: {
      control: form.querySelector("#accept-terms"),
      error: form.querySelector('[data-error-for="acceptTerms"]')
    }
  };

  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "country",
    "city",
    "howFoundUs",
    "dateOfBirth",
    "acceptTerms"
  ];

  function setOptions(select, placeholder, options) {
    select.replaceChildren(new Option(placeholder, ""));
    options.forEach(([label, value]) => select.add(new Option(label, value)));
  }

  function clearError(fieldName) {
    const field = fields[fieldName];
    field.control.removeAttribute("aria-invalid");
    field.error.textContent = "";
    field.error.hidden = true;
  }

  function setError(fieldName, message) {
    const field = fields[fieldName];
    field.control.setAttribute("aria-invalid", "true");
    field.error.textContent = message;
    field.error.hidden = false;
  }

  function updateCities() {
    const options = citiesByCountry[countrySelect.value] || [];
    citySelect.disabled = options.length === 0;
    citySelect.value = "";
    setOptions(citySelect, options.length ? "Select your city" : "Select your country first", options);
    updateLocations();
  }

  function updateLocations() {
    const countryLocations = locationsByCountryAndCity[countrySelect.value] || {};
    const locationNames = countryLocations[citySelect.value] || [];
    locationSelect.disabled = locationNames.length === 0;
    locationSelect.value = "";
    setOptions(
      locationSelect,
      locationNames.length ? "Choose a favorite location" : "Select a city first",
      locationNames.map((name) => [name, name])
    );
  }

  function isAtLeast18(dateValue) {
    if (!dateValue) return false;

    const [year, month, day] = dateValue.split("-").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const birthdayHasPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!birthdayHasPassed) age -= 1;

    return (
      birthDate.getFullYear() === year &&
      birthDate.getMonth() === month - 1 &&
      birthDate.getDate() === day &&
      birthDate <= today &&
      age >= 18
    );
  }

  function hasValidPhone(phoneValue) {
    const compactPhone = phoneValue.replace(/\s/g, "");
    const countryCode = countrySelect.value === "colombia"
      ? "+57"
      : countrySelect.value === "united-states"
        ? "+1"
        : "";

    if (countryCode) {
      if (!compactPhone.startsWith(countryCode)) return false;
      return countryCode === "+57"
        ? /^\+57\d{7,12}$/.test(compactPhone)
        : /^\+1\d{10}$/.test(compactPhone);
    }

    return /^\+57\d{7,12}$/.test(compactPhone) || /^\+1\d{10}$/.test(compactPhone);
  }

  function getError(fieldName) {
    const value = fields[fieldName].control.value.trim();

    switch (fieldName) {
      case "fullName":
        return value.split(/\s+/).filter(Boolean).length >= 2
          ? ""
          : validationMessages.fullName;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : validationMessages.email;
      case "phone":
        return hasValidPhone(value)
          ? ""
          : validationMessages.phone;
      case "country":
        return value ? "" : validationMessages.country;
      case "city":
        return value ? "" : validationMessages.city;
      case "favoriteLocation": {
        const allowedLocations = locationsByCountryAndCity[countrySelect.value]?.[citySelect.value] || [];
        return !value || allowedLocations.includes(value)
          ? ""
          : validationMessages.favoriteLocation;
      }
      case "howFoundUs":
        return value ? "" : validationMessages.howFoundUs;
      case "dateOfBirth":
        return isAtLeast18(value) ? "" : validationMessages.dateOfBirth;
      case "acceptTerms":
        return fields.acceptTerms.control.checked
          ? ""
          : validationMessages.acceptTerms;
      default:
        return "";
    }
  }

  function validateField(fieldName) {
    const message = getError(fieldName);
    if (message) {
      setError(fieldName, message);
      return false;
    }

    clearError(fieldName);
    return true;
  }

  function resetErrors() {
    Object.keys(fields).forEach(clearError);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const today = new Date();
  const latestEligibleBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  fields.dateOfBirth.control.max = formatDate(latestEligibleBirthDate);

  updateCities();

  Object.entries(fields).forEach(([fieldName, field]) => {
    const control = field.control;
    control.addEventListener("blur", () => {
      touchedFields.add(fieldName);
      validateField(fieldName);
    });
    ["input", "change"].forEach((eventName) => {
      control.addEventListener(eventName, () => {
        if (touchedFields.has(fieldName) || submitted) validateField(fieldName);
      });
    });
  });

  countrySelect.addEventListener("change", () => {
    updateCities();
    ["city", "favoriteLocation"].forEach(clearError);
    if (touchedFields.has("phone") || submitted) validateField("phone");
  });

  citySelect.addEventListener("change", () => {
    updateLocations();
    clearError("favoriteLocation");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitted = true;
    const fieldsToValidate = [...requiredFields, "favoriteLocation"];
    const invalidFields = fieldsToValidate.filter((fieldName) => !validateField(fieldName));

    if (invalidFields.length) {
      fields[invalidFields[0]].control.focus();
      return;
    }

    successMessage.hidden = false;
    successMessage.focus();
    successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      touchedFields.clear();
      submitted = false;
      updateCities();
      resetErrors();
      successMessage.hidden = true;
    }, 0);
  });
}