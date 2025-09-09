import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const user = JSON.parse(localStorage.getItem("vg_user") || "null");

  // Если уже авторизован, перенаправляем
  if (user) {
    return <Navigate to="/vote" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!login.trim() || !password.trim()) {
      setError("Заполните все поля");
      setIsSubmitting(false);
      return;
    }

    // Проверяем логин/пароль и создаем правильные данные пользователя
    let userData = null;

    if (login === "admin" && password === "123") {
      userData = {
        id: "user_001",
        login: "admin",
        role: "responsible",
        house: "Корабельная_1",
        street: "Корабельная",
        houseNumber: "1",
        fullName: "Администратор системы",
        phone: "+7 999 123 45 67",
      };
    } else if (login === "user1" && password === "123") {
      userData = {
        id: "user_002",
        login: "user1",
        role: "participant",
        house: "Корабельная_3",
        street: "Корабельная",
        houseNumber: "3",
        fullName: "Петров Петр Петрович",
        phone: "+7 999 765 43 21",
      };
    } else if (login === "user2" && password === "123") {
      userData = {
        id: "user_003",
        login: "user2",
        role: "participant",
        house: "Корабельная_5",
        street: "Корабельная",
        houseNumber: "5",
        fullName: "Сидоров Сидор Сидорович",
        phone: "+7 999 555 55 55",
      };
    } else if (login === "user3" && password === "123") {
      userData = {
        id: "user_004",
        login: "user3",
        role: "participant",
        house: "Садовая_10",
        street: "Садовая",
        houseNumber: "10",
        fullName: "Козлов Козел Козлович",
        phone: "+7 999 111 22 33",
      };
    }

    if (userData) {
      localStorage.setItem("vg_user", JSON.stringify(userData));
      // Принудительно перенаправляем через изменение window.location
      window.location.href = "/vote";
    } else {
      setError("Неверный логин или пароль");
    }

    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #465767 0%, #334155 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Декоративные элементы фона */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          animation: "float 20s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "300px",
          height: "300px",
          background:
            "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          width: "200px",
          height: "200px",
          background:
            "linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          borderRadius: "50%",
          filter: "blur(30px)",
        }}
      />

      {/* Основная карточка */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "24px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Заголовок с логотипом */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ marginBottom: "24px" }}>
            <svg
              width="200"
              height="160"
              viewBox="0 0 240 192"
              style={{ margin: "0 auto" }}
            >
              {/* Солнце */}
              <circle cx="50" cy="50" r="16" fill="#d4a574" />
              {/* Лучи солнца */}
              <line
                x1="50"
                y1="20"
                x2="50"
                y2="10"
                stroke="#d4a574"
                strokeWidth="4"
              />
              <line
                x1="72"
                y1="28"
                x2="78"
                y2="22"
                stroke="#d4a574"
                strokeWidth="4"
              />
              <line
                x1="80"
                y1="50"
                x2="90"
                y2="50"
                stroke="#d4a574"
                strokeWidth="4"
              />
              <line
                x1="72"
                y1="72"
                x2="78"
                y2="78"
                stroke="#d4a574"
                strokeWidth="4"
              />
              <line
                x1="50"
                y1="80"
                x2="50"
                y2="90"
                stroke="#d4a574"
                strokeWidth="4"
              />
              <line
                x1="28"
                y1="72"
                x2="22"
                y2="78"
                stroke="#d4a574"
                strokeWidth="4"
              />
              <line
                x1="20"
                y1="50"
                x2="10"
                y2="50"
                stroke="#d4a574"
                strokeWidth="4"
              />
              <line
                x1="28"
                y1="28"
                x2="22"
                y2="22"
                stroke="#d4a574"
                strokeWidth="4"
              />

              {/* Домики */}
              {/* Левый синий дом */}
              <rect
                x="80"
                y="60"
                width="32"
                height="50"
                fill="#2563eb"
                rx="2"
              />
              <polygon points="80,60 96,40 112,60" fill="#2563eb" />
              <rect x="86" y="68" width="6" height="6" fill="white" />
              <rect x="98" y="68" width="6" height="6" fill="white" />
              <rect x="90" y="90" width="8" height="20" fill="white" />

              {/* Центральный большой синий дом */}
              <rect
                x="116"
                y="40"
                width="40"
                height="70"
                fill="#2563eb"
                rx="2"
              />
              <polygon points="116,40 136,16 156,40" fill="#2563eb" />
              <rect x="124" y="52" width="6" height="8" fill="white" />
              <rect x="134" y="52" width="6" height="8" fill="white" />
              <rect x="144" y="52" width="6" height="8" fill="white" />
              <rect x="124" y="64" width="6" height="8" fill="white" />
              <rect x="134" y="64" width="6" height="8" fill="white" />
              <rect x="144" y="64" width="6" height="8" fill="white" />
              <rect x="130" y="84" width="12" height="26" fill="white" />

              {/* Правый зеленый дом */}
              <rect
                x="160"
                y="56"
                width="36"
                height="54"
                fill="#22c55e"
                rx="2"
              />
              <polygon points="160,56 178,36 196,56" fill="#22c55e" />
              <rect x="168" y="66" width="6" height="6" fill="white" />
              <rect x="178" y="66" width="6" height="6" fill="white" />
              <rect x="168" y="76" width="6" height="6" fill="white" />
              <rect x="178" y="76" width="6" height="6" fill="white" />
              <rect x="172" y="92" width="8" height="18" fill="white" />

              {/* Холмы/трава */}
              <path
                d="M 30 130 Q 70 110 110 120 Q 150 100 190 110 Q 210 120 230 110"
                fill="none"
                stroke="#8fbc8f"
                strokeWidth="6"
              />
              <path
                d="M 20 140 Q 60 120 100 130 Q 140 110 180 120 Q 200 130 240 120"
                fill="none"
                stroke="#9ccc65"
                strokeWidth="6"
              />

              {/* Водная гладь */}
              <path
                d="M 40 150 Q 80 140 120 150 Q 160 140 200 150"
                fill="none"
                stroke="#4a90a4"
                strokeWidth="4"
              />
              <path
                d="M 30 156 Q 70 146 110 156 Q 150 146 190 156"
                fill="none"
                stroke="#4a90a4"
                strokeWidth="4"
              />

              {/* Кораблик-парусник (в четыре раза больше и сильно правее) */}
              <g transform="translate(160, 130)">
                {/* Корпус лодки */}
                <path
                  d="M 8 48 L 72 48 Q 80 40 72 32 L 16 32 Q 8 40 8 48"
                  fill="#2563eb"
                />
                {/* Мачта */}
                <line
                  x1="40"
                  y1="32"
                  x2="40"
                  y2="-32"
                  stroke="#654321"
                  strokeWidth="6"
                />
                {/* Большой парус */}
                <path
                  d="M 40 -32 Q 72 -16 72 16 L 40 32"
                  fill="#4a90a4"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                {/* Малый парус */}
                <path
                  d="M 40 -24 Q 16 -8 16 8 L 40 16"
                  fill="#87ceeb"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                {/* Волны под лодкой */}
                <path
                  d="M 0 52 Q 20 44 40 52 Q 60 44 80 52"
                  stroke="#4a90a4"
                  strokeWidth="6"
                  fill="none"
                />
              </g>
            </svg>
          </div>
          <h1
            style={{
              color: "white",
              fontSize: "28px",
              fontWeight: "300",
              margin: "0 0 8px 0",
              letterSpacing: "1px",
            }}
          >
            Авторизация
          </h1>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "16px",
              margin: 0,
            }}
          >
            СмартСовет - система голосований
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }}>
          {/* Поле логин */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "16px 50px 16px 20px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "12px",
                color: "white",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.5)";
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.3)";
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "18px",
              }}
            >
              👤
            </div>
          </div>

          {/* Поле пароль */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "16px 80px 16px 20px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "12px",
                color: "white",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.5)";
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.3)";
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "48px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "16px",
              }}
            >
              🔒
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Ошибка */}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fecaca",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              {error}
            </div>
          )}

          {/* Кнопка входа */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: isSubmitting
                ? "rgba(255, 255, 255, 0.2)"
                : "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              transform: isSubmitting ? "none" : "translateY(0px)",
              boxShadow: isSubmitting
                ? "none"
                : "0 4px 15px rgba(34, 197, 94, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(34, 197, 94, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "0 4px 15px rgba(34, 197, 94, 0.3)";
              }
            }}
          >
            {isSubmitting ? "Вход..." : "Войти"}
          </button>

          {/* Ссылка на восстановление пароля */}
          <div style={{ textAlign: "center" }}>
            <a
              href="#"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                textDecoration: "none",
                borderBottom: "1px solid transparent",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderBottom =
                  "1px solid rgba(255, 255, 255, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderBottom = "1px solid transparent";
              }}
            >
              Забыли пароль?
            </a>
          </div>
        </form>

        {/* Тестовые данные */}
        <div
          style={{
            marginTop: "32px",
            padding: "20px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h3
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "14px",
              fontWeight: "600",
              margin: "0 0 12px 0",
            }}
          >
            Тестовые аккаунты:
          </h3>
          <div
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "12px",
              lineHeight: "1.6",
            }}
          >
            <div>
              <strong>admin / 123</strong> - Ответственный
            </div>
            <div>
              <strong>user1 / 123</strong> - Участник
            </div>
            <div>
              <strong>user2 / 123</strong> - Участник
            </div>
            <div>
              <strong>user3 / 123</strong> - Участник
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        ::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1) inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}
