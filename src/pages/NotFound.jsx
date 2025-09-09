import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px" }}>
      <h1>404 — страница не найдена</h1>
      <p>Похоже, такого адреса в приложении нет.</p>
      <Link to="/vote">На страницу голосования</Link>
    </div>
  );
}
