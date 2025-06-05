import React from "react";
import { FaEye, FaEyeSlash, FaTrash, FaDownload, FaEnvelope, FaPhone } from "react-icons/fa";
import axios from "axios";
import Cookie from "js-cookie";

export type Option = {
  label: string;
  value: string;
};

export type InputProps = {
  label: string;
  name: string;
  type?:
    | "text"
    | "select"
    | "file"
    | "radio"
    | "checkbox"
    | "date"
    | "password"
    | "email"
    | "telephone"
    | "number"
    | "default";
  value: any;
  onChange: (event: React.ChangeEvent<any>) => void;
  options?: Option[];
  table?: string;
  id?: string;
  min?: number;
  max?: number;
  error?: string | null;
};

const InputManager: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  table,
  id,
  min,
  max,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const [error, setError] = React.useState<string | null>(null);

  const [phoneError, setPhoneError] = React.useState<string | null>(null);

  const validatePhone = (phone: string) => {
    const regex = /^(\+33|0)[1-9](\d{2}){4}$/;
    return regex.test(phone.replace(/\s+/g, ""));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    const isValid = validatePhone(e.target.value);
    setPhoneError(isValid ? null : "Numéro de téléphone invalide.");
  };

  const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setError(null);
      onChange(e);
      return;
    }

    const numVal = Number(val);

    if (isNaN(numVal)) {
      setError("Veuillez entrer un nombre valide.");
    } else if (min !== undefined && numVal < min) {
      setError(`Le nombre doit être au moins ${min}.`);
    } else if (max !== undefined && numVal > max) {
      setError(`Le nombre doit être au maximum ${max}.`);
    } else {
      setError(null);
    }

    onChange(e);
  };

  const renderFileActions = () => {
    if (!value || typeof value !== "string") return null;

    const filename = value.split("/").pop();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleDelete = async () => {
      try {
        await axios.delete(`${apiUrl}file/${table}/${name}/${id}`, {
          headers: {
            Authorization: "Bearer " + Cookie.get("token"),
          },
        });

        onChange({ target: { name, value: "" } } as React.ChangeEvent<any>);
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier :", error);
      }
    };
    

    return (
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <span>
          Fichier existant : <span className="font-medium">{filename}</span>
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            title="Aperçu du fichier"
            onClick={() => window.open(`${apiUrl}preview/${filename}`, "_blank")}
            className="text-green-500 hover:text-green-700"
          >
            <FaEye />
          </button>
          <button
            type="button"
            title="Télécharger le fichier"
            onClick={() => window.open(`${apiUrl}download/${filename}`, "_blank")}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaDownload />
          </button>
          <button
            type="button"
            title="Supprimer le fichier"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  const commonProps = {
    id: name,
    name,
    value,
    onChange,
    className:
      "mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
  };

  return (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>

      {type === "select" ? (
        <select {...commonProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-black">
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "text" ? (
        <textarea {...commonProps} className={`${commonProps.className} h-24`} />
      ) : type === "file" ? (
        <>
          <input type="file" id={name} name={name} onChange={onChange} className={commonProps.className} />
          {renderFileActions() || <p className="mt-2 text-sm text-gray-600">Aucun fichier sélectionné</p>}
        </>
      ) : type === "radio" ? (
        <div className="mt-2 flex gap-4">
          {options.map((option) => (
            <label key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-bold">{option.label}</span>
            </label>
          ))}
        </div>
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={!!value}
          onChange={onChange}
          className="mt-1 mr-2"
        />
      ) : type === "date" ? (
        <input
          type="date"
          {...commonProps}
        />
      ) : type === "password" ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...commonProps}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 pr-2 flex items-center text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      ) : type === "email" ? (
        <div className="mb-1">
          <div className="relative">
            <FaEnvelope className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="email"
              id={name}
              name={name}
              value={value}
              onChange={(e) => {
                onChange(e);
                const isValid = validateEmail(e.target.value);
                setEmailError(isValid ? null : "Adresse email invalide.");
              }}
              placeholder="exemple@domaine.com"
              required
              className={`block w-full pr-10 p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                emailError ? "border-red-500 focus:border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>
      ) : type === "telephone" ? (
        <div className="mb-1">
          <div className="relative">
            <FaPhone className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="tel"
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              className={`block w-full pr-10 p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                phoneError ? "border-red-500 focus:border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
        </div>
      ) : type === "number" ? (
        <div className="mb-1">
          <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={handleChangeNumber}
            min={min}
            max={max}
            className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-300"
            }`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <input type="text" {...commonProps} />
      )}
    </div>
  );
};

export default InputManager;
