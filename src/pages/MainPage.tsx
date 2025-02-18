import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => {
          navigate(`/2025`);
        }}
      >
        2025
      </button>
      <button
        onClick={() => {
          navigate(`/2024`);
        }}
      >
        2024
      </button>
      <button
        onClick={() => {
          navigate(`/2023`);
        }}
      >
        2023
      </button>
    </div>
  );
};

export default MainPage;
